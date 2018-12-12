import { Apis } from 'bitsharesjs-ws';
import listener from './chain-listener';
import Subscriptions from './subscriptions';
import { getFiatMultiplier } from './history.js';

const findOrder = (orderId) => {
  return (order) => orderId === order.id;
};

const getFillOrders = async (baseId, quoteId, limit = 1) => {
  try {
    const orders = await Apis.instance().history_api().exec(
      'get_fill_order_history',
      [baseId, quoteId, limit]
    );
    return orders.map((obj) => obj.op);
  } catch (e) {
    console.log('Smth wrong', e);
    return [];
  }
};

const loadLimitOrders = async (baseId, quoteId, limit = 200) => {
  try {
    const orders = await Apis.instance().db_api().exec(
      'get_limit_orders',
      [baseId, quoteId, limit]
    );
    const buyOrders = [];
    const sellOrders = [];
    orders.forEach((order) => {
      if (order.sell_price.base.asset_id === baseId) {
        buyOrders.push(order);
      } else {
        sellOrders.push(order);
      }
    });
    return { buyOrders, sellOrders };
  } catch (e) {
    return {
      buyOrders: [],
      sellOrders: []
    };
  }
};

class Market {
  constructor(base) {
    this.base = base;
    this.markets = {};
    this.fee = 578;
    const marketsSubscription = new Subscriptions.Markets({
      callback: this.onMarketUpdate.bind(this)
    });
    listener.addSubscription(marketsSubscription);
  }

  // It returns sides, needed to place order
  // type: spend | get
  // asset - asset to get or to spend
  // spend, get - amounts
  // get amount is optional, if we not providing it - this function will return data for market order.
  getOrderSides({ type, asset, spend, get }) {
    const [spendAsset, getAsset] = (type === 'spend') ? [asset, this.base] : [this.base, asset];

    return {
      sell: {
        asset_id: spendAsset.id,
        amount: spend
      },
      receive: {
        asset_id: getAsset.id,
        amount: get || 0 // Placing 0 if get amount not specified, so it will be market order side
      }
    };
  }

  async fetchStats(quotes, fiatAsset) {
    const quotePromise = quote => Apis.instance().db_api().exec('get_ticker', [this.base.symbol, quote]);
    const rawStats = await Promise.all(quotes.map(quotePromise));
    const fiatPrices = await getFiatMultiplier(this.base, fiatAsset);

    return rawStats.reduce((result, raw) => {
      // eslint-disable-next-line
      const { latest, percent_change, base_volume, quote, base } = raw;
      const baseVolume = parseFloat(base_volume, 10);
      const usdVolume = baseVolume / fiatPrices.median;
      const price = parseFloat(latest, 10);
      const usdPrice = price / fiatPrices.last;
      const ticker = quote;
      const change24h = parseFloat(percent_change, 10);

      result[quote] = {
        baseVolume, usdVolume, price, usdPrice, ticker, base, change24h
      };
      return result;
    }, {});
  }

  getFee() {
    return this.fee;
  }

  getCallbacks(pays, receives) {
    if (pays === this.base.id) {
      if (this.isSubscribed(receives)) {
        return {
          callback: this.markets[receives].callback,
          lastOrderCallback: this.markets[receives].lastOrderCallback
        };
      }
    }
    if (receives === this.base.id) {
      if (this.isSubscribed(pays)) {
        return {
          callback: this.markets[pays].callback,
          lastOrderCallback: this.markets[pays].lastOrderCallback
        };
      }
    }
    return false;
  }

  getBook(quote) {
    return this.markets[quote.id].orders;
  }

  getOrdersArray(pays, receives) {
    if (pays === this.base.id) {
      if (this.isSubscribed(receives)) {
        return this.markets[receives].orders.buy;
      }
    }
    if (receives === this.base.id) {
      if (this.isSubscribed(pays)) {
        return this.markets[pays].orders.sell;
      }
    }
    return false;
  }

  onMarketUpdate(type, object) {
    switch (type) {
      case 'newOrder': {
        this.onNewLimitOrder(object);
        break;
      }
      case 'deleteOrder': {
        this.onOrderDelete(object);
        break;
      }
      case 'fillOrder': {
        this.onOrderFill(object);
        break;
      }
      default: break;
    }
  }

  onOrderDelete(notification) {
    Object.keys(this.markets).forEach((market) => {
      Object.keys(this.markets[market].orders).forEach((type) => {
        const idx = this.markets[market].orders[type].findIndex(findOrder(notification));
        if (idx >= 0) {
          this.markets[market].orders[type].splice(idx, 1);
          this.markets[market].callback('DELETE ORDER');
        }
      });
    });
  }

  onNewLimitOrder(order) {
    const {
      base: {
        asset_id: pays
      },
      quote: {
        asset_id: receives
      }
    } = order.sell_price;

    const orders = this.getOrdersArray(pays, receives);

    if (orders) {
      orders.push(order);
      const { callback } = this.getCallbacks(pays, receives);
      callback('ADD ORDER');
    }
  }

  onOrderFill(data) {
    const {
      order_id: orderId,
      pays: { amount, asset_id: pays },
      receives: { asset_id: receives }
    } = data.op[1];

    const orders = this.getOrdersArray(pays, receives);

    if (orders) {
      const idx = orders.findIndex(findOrder(orderId));
      if (idx !== -1) {
        orders[idx].for_sale -= amount;
        const { callback } = this.getCallbacks(pays, receives);
        callback('FILL ORDER');
      }
    }

    const { lastOrderCallback } = this.getCallbacks(pays, receives);

    // Send order fill data to lastOrderCallback if exists
    if (lastOrderCallback) {
      lastOrderCallback(data.op[1]);
    }
  }

  isSubscribed(assetId) {
    return (this.markets[assetId] !== undefined);
  }

  setDefaultObjects(assetId) {
    if (!this.markets[assetId]) {
      this.markets[assetId] = {
        orders: {
          buy: [], sell: []
        },
        callback: null,
        lastOrderCallback: null
      };
    }
  }

  async subscribeToMarket(assetId, callback) {
    if (assetId === this.base.id) return;
    const { buyOrders, sellOrders } = await loadLimitOrders(this.base.id, assetId);
    this.setDefaultObjects(assetId);
    // console.log('setting default: ' + assetId + ' : ', this.markets[assetId]);
    this.markets[assetId].orders.buy = buyOrders;
    this.markets[assetId].orders.sell = sellOrders;
    this.markets[assetId].callback = callback;
    callback();
  }

  async subscribeToLastOrder(assetId, callback) {
    this.setDefaultObjects(assetId);
    this.markets[assetId].lastOrderCallback = callback;
    const [lastOrder] = await getFillOrders(this.base.id, assetId);
    if (lastOrder) {
      this.markets[assetId].lastOrderCallback(lastOrder);
    }
  }

  async unsubscribeFromLastOrder(assetId) {
    this.markets[assetId].lastOrderCallback = null;
  }

  unsubscribeFromMarket(assetId) {
    if (this.isSubscribed(assetId)) {
      delete this.markets[assetId];
    }
  }

  unsubscribeFromExchangeRate(assetId) {
    this.unsubscribeFromMarket(assetId);
  }

  unsubscribeFromMarkets() {
    this.markets = {};
  }
}

const markets = {};
export default (baseAsset) => {
  if (markets[baseAsset.id]) {
    return markets[baseAsset.id];
  }
  const baseMarket = new Market(baseAsset);
  markets[baseAsset.id] = baseMarket;
  return markets[baseAsset.id];
};

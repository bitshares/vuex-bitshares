/* eslint no-shadow: ["error", { "allow": ["getters"] }] */
import { key, PrivateKey } from 'bitsharesjs';

const parseOpenOrders = (orders, rootGetters) => {
  const parsedActiveOrders = orders.map(order => {
    // need to get if from somewhere
    const isBid = true;

    const payInSellPrice = isBid ? order.sell_price.base : order.sell_price.quote;
    const payAssetId = payInSellPrice.asset_id;
    const payAsset = rootGetters['assets/getAssetById'](payAssetId);

    const receiveInSellPrice = isBid ? order.sell_price.quote : order.sell_price.base;
    const receiveAssetId = receiveInSellPrice.asset_id;
    const receiveAsset = rootGetters['assets/getAssetById'](receiveAssetId);

    const get = isBid
      ? parseFloat(receiveInSellPrice.amount) / (10 ** receiveAsset.precision)
      : parseFloat(payInSellPrice.amount) / (10 ** payAsset.precision);
    const spend = isBid
      ? parseFloat(payInSellPrice.amount) / (10 ** payAsset.precision)
      : parseFloat(receiveInSellPrice.amount) / (10 ** receiveAsset.precision);

    const payAssetSymbol = isBid ? payAsset.symbol : receiveAsset.symbol;
    const receiveAssetSymbol = isBid ? receiveAsset.symbol : payAsset.symbol;
    const filled = (order.sell_price.base.amount - order.for_sale) / (order.sell_price.base.amount);

    const price = isBid
      ? parseFloat(spend / get)
      : parseFloat(get / spend);

    const expiration = (new Date(order.expiration)).getTime();

    return {
      payAssetSymbol,
      receiveAssetSymbol,
      expiration,
      get,
      order: isBid ? 'buy' : 'sell',
      vol: isBid ? get : spend,
      spend,
      price,
      filled,
      orderId: order.id
    };
  });
  return parsedActiveOrders;
};

const getters = {
  getAccountUserId: state => {
    return state.userId;
  },
  getBrainkey: state => {
    if (!state.wallet.aesPrivate) return null;
    return state.wallet.aesPrivate.decryptHexToText(state.wallet.encryptedBrainkey);
  },
  getCurrentUserName: state => {
    return (state.userData && state.userData.account.name) || null;
  },
  getUserBalances: state => {
    if (!state.userData || !state.userData.balances) return {};
    const { balances } = state.userData;
    const nonZeroBalances = Object.keys(balances).reduce((result, assetId) => {
      if (balances[assetId].balance) result[assetId] = balances[assetId];
      return result;
    }, {});
    return nonZeroBalances;
  },
  isLocked: state => {
    return !state.wallet.aesPrivate && (!state.keys.active || !state.keys.owner);
  },
  getLoginType: state => state.userType,
  isLoggedIn: state => !!state.userId,
  isValidPassword: state => {
    return password => {
      const passwordPrivate = PrivateKey.fromSeed(password);
      const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();
      return passwordPubkey === state.wallet.passwordPubkey;
    };
  },
  getKeys: state => {
    if (state.keys && state.keys.active && state.keys.owner) {
      return state.keys;
    }
    if (!state.wallet || !state.wallet.aesPrivate) return null;
    const brainkey = state.wallet.aesPrivate.decryptHexToText(state.wallet.encryptedBrainkey);
    if (!brainkey) return null;
    return {
      active: key.get_brainPrivateKey(brainkey, 0),
      owner: key.get_brainPrivateKey(brainkey, 1)
    };
  },
  isWalletAcc: state => state.userType === 'wallet',
  getActiveOrders: (state, getters, rootState, rootGetters) => {
    if (state.userData && state.userData.limit_orders) {
      return parseOpenOrders(state.userData.limit_orders, rootGetters);
    }
    return [];
  }
};

export default getters;

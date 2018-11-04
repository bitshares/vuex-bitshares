import Vue from 'vue';
import * as types from '../mutations';
import API from '../services/api';
import config from '../../config';

const BtsMarket = API.Market.BTS;

const actions = {
  async fetchMarketStats({ commit, dispatch }, base) {
    commit(types.FETCH_MARKET_STATS_REQUEST, base);
    const quotes = config.defaultMarkets[base];
    try {
      const stats = await API.History.getMarketStats(base, 'USD', quotes);
      console.log('fetched stats: ', stats);
      commit(types.FETCH_MARKET_STATS_REQUEST_COMPLETE, { base, stats });
      dispatch('market/fetch7dMarketStats', base, { root: true });
      return stats;
    } catch (e) {
      console.log(e);
      commit(types.FETCH_MARKET_STATS_REQUEST_ERROR, { base, error: e});
      return false;
    }
  },
  async fetch7dMarketStats({ commit }, base) {
    const quotes = config.defaultMarkets[base];
    const stats7d = await API.History.getMarketChanges7d(base, quotes);
    commit(types.FETCH_MARKET_STATS_7D_COMPLETE, { base, stats7d });
    return stats7d;
  },
  subscribeToMarket(store, { balances }) {
    const { commit } = store;
    const assetsIds = Object.keys(balances);

    Promise.all(assetsIds.map(assetId => {
      const { balance } = balances[assetId];
      return BtsMarket.subscribeToExchangeRate(assetId, balance, (id, amount) => {
        if (!amount) return;
        const rate = amount / balance;
        console.log(assetId + ' new bts amount: : ' + amount);
        actions.updateMarketPrice(store, {
          assetId: id,
          price: rate
        });
      }).then(() => {
        console.log('SUBSCRIBED TO : ' + assetId + ' : ' + balance);
      });
    })).then(() => {
      commit(types.SUB_TO_MARKET_COMPLETE);
      console.log('subscribed to market successfully');
    });
  },

  unsubscribeFromMarket(store, { balances }) {
    const { commit } = store;
    const assetsIds = Object.keys(balances);
    BtsMarket.unsubscribeFromMarkets();
    Promise.all(assetsIds.map(id => {
      console.log('unsubscribing: ', id);
      return BtsMarket.unsubscribeFromExchangeRate(id);
    })).then(() => {
      commit(types.UNSUB_FROM_MARKET_COMPLETE);
      console.log('unsubscribed from market');
    });
  },

  updateMarketPrice(store, { assetId, price }) {
    const { commit } = store;
    commit(types.UPDATE_MARKET_PRICE, { assetId, price });
    store.dispatch('transactions/createOrdersFromDistribution', null, { root: true });
  }
};

const getters = {
  getBaseAssetId: state => state.baseAssetId,
  getPrices: state => state.prices,
  getPriceById: state => {
    return (assetId) => {
      if (assetId === state.baseId) return 1;
      return state.prices[assetId] || 0;
    };
  },
  getMarketBases: state => state.marketBases,
  getMarketStats: state => state.stats,
  getMarketStats7d: state => state.stats7d,
  isFetching: state => state.pending,
  isError: state => state.error,
  isSubscribed: state => state.subscribed,
};

const initialState = {
  pending: false,
  error: false,
  baseAssetId: null,
  subscribed: false,
  prices: {},
  baseId: '1.3.0',
  stats: {},
  marketBases: config.marketBases
};

const mutations = {
  [types.UPDATE_MARKET_PRICE](state, { assetId, price }) {
    Vue.set(state.prices, assetId, price);
  },
  [types.SUB_TO_MARKET_COMPLETE](state) {
    state.subscribed = true;
  },
  [types.UNSUB_FROM_MARKET_COMPLETE](state) {
    state.subscribed = false;
  },
  [types.FETCH_MARKET_STATS_REQUEST](state, base) {
    const list = state.stats[base] && state.stats[base].list || {}
    state.stats = {
      ...state.stats,
      [base]: { list, fetching: true }
    }
  },
  [types.FETCH_MARKET_STATS_REQUEST_COMPLETE](state, { base, stats }) {
    state.stats[base].list = stats;
    state.stats[base].fetching = false;
  },
  [types.FETCH_MARKET_STATS_REQUEST_ERROR](state, { base, error }) {
    state.stats[base].error = true;
    state.stats[base].fetching = false;
  },
  [types.FETCH_MARKET_STATS_7D_COMPLETE](state, { base, stats7d }) {
    Object.keys(stats7d).forEach(quote => {
      const quoteStats = state.stats[base][quote]
      if (quoteStats) quoteStats.change7d = stats7d[quote]
    })
  }
};

export default {
  state: initialState,
  actions,
  getters,
  mutations,
  namespaced: true
};

import Vue from 'vue';
import * as types from '../mutations';
import API from '../services/api';
import config from '../../config';


const actions = {
  async fetchMarketStats({ commit, dispatch }, base) {
    commit(types.FETCH_MARKET_STATS_REQUEST, base);
    const quotes = config.defaultMarkets[base];
    try {
      const stats = await API.History.getMarketStats(base, 'USD', quotes);
      await commit(types.FETCH_MARKET_STATS_REQUEST_COMPLETE, { base, stats });
      dispatch('market/fetch7dMarketStats', base, { root: true });
      return stats;
    } catch (e) {
      console.log(e);
      commit(types.FETCH_MARKET_STATS_REQUEST_ERROR, { base });
      return false;
    }
  },
  async fetch7dMarketStats({ commit }, base) {
    const quotes = config.defaultMarkets[base];
    const stats7d = await API.History.getMarketChanges7d(base, quotes);
    commit(types.FETCH_MARKET_STATS_7D_COMPLETE, { base, stats7d });
    return stats7d;
  },
  async subscribeToMarket(store, { baseSymbol, quoteSymbol }) {
    const { commit, rootGetters, getters } = store;
    const baseAsset = rootGetters['assets/getAssetBySymbol'](baseSymbol);
    const market = API.Market(baseAsset);
    if (market) {
      const quoteAsset = rootGetters['assets/getAssetBySymbol'](quoteSymbol);
      commit(types.SUB_TO_MARKET_REQUEST, { baseAsset, quoteAsset });
      console.log('ON SUBSCRIBE!', getters);
      await market.subscribeToMarket(quoteAsset.id, (update) => {
        commit(types.UPDATE_MARKET_BOOK, new Date());
        console.log('Receive update', update, getters.getOrderBook);
      });
      commit(types.SUB_TO_MARKET_COMPLETE);
    } else {
      commit(types.SUB_TO_MARKET_ERROR, 'no such market');
    }
  },
  unsubscribeFromMarket(store) {
    const { commit, getters } = store;
    if (getters.isSubscribed) {
      const { base, quote } = getters.getMarketAssts;
      const market = API.Market(base);
      market.unsubscribeFromMarket(quote.id);
      commit(types.UNSUB_FROM_MARKET_COMPLETE);
    }
  }
};

const getters = {
  getMarketBases: state => state.marketBases,
  getMarketStats: state => state.stats,
  getMarketStats7d: state => state.stats7d,
  isFetching: state => state.pending,
  isError: state => state.error,
  isSubscribed: state => state.subscribed,
  getMarketAssts: state => ({
    base: state.baseAsset,
    quote: state.quoteAsset
  }),
  getOrderBook: state => {
    if (state.bookLastUpdated) {
      return API.Market(state.baseAsset).getBook(state.quoteAsset);
    }
    return {
      buyOrders: [],
      sellOrders: []
    };
  }
};

const initialState = {
  pending: false,
  error: false,
  subscribed: false,
  baseAsset: null,
  quoteAsset: null,
  stats: {},
  bookLastUpdated: 0,
  marketBases: config.marketBases
};

const mutations = {
  [types.FETCH_MARKET_STATS_REQUEST](state, base) {
    const list = (state.stats[base] && state.stats[base].list) || {};
    state.stats = {
      ...state.stats,
      [base]: { list, fetching: true }
    };
  },
  [types.FETCH_MARKET_STATS_REQUEST_COMPLETE](state, { base, stats }) {
    state.stats[base].list = stats;
    state.stats[base].fetching = false;
  },
  [types.FETCH_MARKET_STATS_REQUEST_ERROR](state, { base }) {
    state.stats[base].error = true;
    state.stats[base].fetching = false;
  },
  [types.FETCH_MARKET_STATS_7D_COMPLETE](state, { base, stats7d }) {
    Object.keys(stats7d).forEach(quote => {
      const quoteStats = state.stats[base].list[quote];
      if (quoteStats) Vue.set(quoteStats, 'change7d', parseInt(stats7d[quote], 10));
    });
  },
  [types.SUB_TO_MARKET_REQUEST](state, { baseAsset, quoteAsset }) {
    state.pending = true;
    state.baseAsset = baseAsset;
    state.quoteAsset = quoteAsset;
  },
  [types.SUB_TO_MARKET_ERROR](state, error) {
    state.pending = false;
    state.error = error;
  },
  [types.UPDATE_MARKET_BOOK](state, time) {
    state.bookLastUpdated = time;
  },
  [types.SUB_TO_MARKET_COMPLETE](state) {
    state.subscribed = true;
    state.pending = false;
  },
  [types.UNSUB_FROM_MARKET_COMPLETE](state) {
    state.subscribed = false;
  }
};

export default {
  state: initialState,
  actions,
  getters,
  mutations,
  namespaced: true
};

import Vue from 'vue';

export const types = {
  FETCH_PRICES_HISTORY_REQUEST: 'FETCH_PRICES_HISTORY_REQUEST',
  FETCH_PRICES_HISTORY_COMPLETE: 'FETCH_PRICES_HISTORY_COMPLETE',
  FETCH_PRICES_HISTORY_ERROR: 'FETCH_PRICES_HISTORY_ERROR',
  FETCH_PRICES_HISTORY_UPDATE: 'FETCH_PRICES_HISTORY_UPDATE'
};

export const mutations = {
  [types.FETCH_PRICES_HISTORY_REQUEST](state, { baseId }) {
    state.fetching = true;
    state.baseAssetId = baseId;
  },
  [types.FETCH_PRICES_HISTORY_UPDATE](state, { prices, days }) {
    Vue.set(state.days, days, prices);
  },
  [types.FETCH_PRICES_HISTORY_COMPLETE](state) {
    state.fetching = false;
    state.initLoaded = true;
  },
  [types.FETCH_PRICES_HISTORY_ERROR](state) {
    state.fetching = false;
    state.error = true;
  }
};

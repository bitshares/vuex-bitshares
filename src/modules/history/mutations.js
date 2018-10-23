import Vue from 'vue';

export const types = {
  FETCH_PRICES_HISTORY_REQUEST: 'FETCH_PRICES_HISTORY_REQUEST',
  FETCH_PRICES_HISTORY_COMPLETE: 'FETCH_PRICES_HISTORY_COMPLETE',
  FETCH_PRICES_HISTORY_ERROR: 'FETCH_PRICES_HISTORY_ERROR'
};

export const mutations = {
  [types.FETCH_PRICES_HISTORY_REQUEST](state, { baseId }) {
    state.fetching = true;
    state.baseAssetId = baseId;
  },
  [types.FETCH_PRICES_HISTORY_COMPLETE](state, { prices, days }) {
    state.fetching = false;
    Vue.set(state.days, days, prices);
  },
  [types.FETCH_PRICES_HISTORY_ERROR](state) {
    state.fetching = false;
    state.error = true;
  }
};

export const types = {
  FETCH_SYMBOL_STATS_REQUEST: 'FETCH_SYMBOL_STATS_REQUEST',
  FETCH_SYMBOL_STATS_COMPLETE: 'FETCH_SYMBOL_STATS_COMPLETE',
  FETCH_SYMBOL_STATS_ERROR: 'FETCH_SYMBOL_STATS_ERROR',
  RESET_SYMBOL_INFO: 'RESET_SYMBOL_INFO',
  CANCEL_SYMBOL_REQUEST: 'CANCEL_SYMBOL_REQUEST',
};

export const mutations = {
  [types.FETCH_SYMBOL_STATS_REQUEST]: (state) => {
    state.pending = true;
  },
  [types.FETCH_SYMBOL_STATS_ERROR]: (state, { symbol }) => {
    state.pending = false;
    state.stats[symbol] = {};
  },
  [types.FETCH_SYMBOL_STATS_COMPLETE]: (state, { symbol, stats }) => {
    state.pending = false;
    state.stats[symbol] = stats;
  },
  [types.RESET_SYMBOL_INFO]: (state) => {
    state.stats = {};
    state.penging = false;
  },
  [types.CANCEL_SYMBOL_REQUEST]: (state) => {
    state.pending = false;
  }
};

export const types = {
  FETCH_USER_REQUEST: 'FETCH_USER_REQUEST',
  FETCH_USER_COMPLETE: 'FETCH_USER_COMPLETE',
  FETCH_USER_ERROR: 'FETCH_USER_ERROR'
};

export const mutations = {
  [types.FETCH_USER_REQUEST](state) {
    state.fetching = true;
    state.error = false;
  },
  [types.FETCH_USER_COMPLETE](state, result) {
    state.account = result.account;
    state.balances = result.balances;
    state.fetching = false;
  },
  [types.FETCH_USER_ERROR](state) {
    state.fetching = false;
    state.error = true;
  },
};

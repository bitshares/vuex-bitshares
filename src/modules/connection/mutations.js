export const types = {
  WS_CONNECTED: 'WS_CONNECTED',
  WS_DISCONNECTED: 'WS_DISCONNECTED',
  RPC_STATUS_UPDATE: 'RPC_STATUS_UPDATE'
};

export const mutations = {
  [types.WS_CONNECTED](state) {
    state.wsConnected = true;
  },
  [types.WS_DISCONNECTED](state) {
    state.wsConnected = false;
  },
  [types.RPC_STATUS_UPDATE](state, { status }) {
    state.rpcStatus = status;
  }
};

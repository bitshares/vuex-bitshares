const getters = {
  isReady: (state) => {
    return (state.rpcStatus === 'open'
            || state.rpcStatus === 'realopen'
            || state.rpcStatus === 'reconnect') && state.wsConnected;
  }
};

export default getters;

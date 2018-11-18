import API from '../../services/api';
import { types } from './mutations';

/**
 * Initializes connection to Bitsharesjs-WS
 */
const actions = {
  initConnection: ({ commit, getters }, changeNode) => {
    let active = true;
    const updateConnectionStatus = async (status) => {
      if (!active) return;
      const wsConnected = getters.isWsConnected;
      console.log('Connection status : ', status);
      commit(types.RPC_STATUS_UPDATE, { status });
      if (status === 'error' || status === 'closed') {
        commit(types.WS_DISCONNECTED);
        active = false;
        await API.Connection.disconnect();
        actions.initConnection({ commit, getters }, true);
      }
      if (!wsConnected && (status === 'realopen' || status === 'reconnect')) {
        commit(types.WS_CONNECTED);
      }
      if (status === 'realopen') {
        API.ChainListener.enable();
      }
    };

    API.Connection.connect(updateConnectionStatus, changeNode);
  }
};

export default actions;

import { types } from './mutations';
import StatsInfo from '../../services/stats/statsInfo';

const actions = {
  async fetchStats({ commit }, assetSymbol) {
    commit(types.FETCH_SYMBOL_STATS_REQUEST);
    const result = await StatsInfo.getStats(assetSymbol);
    if (result.success) {
      commit(types.FETCH_SYMBOL_STATS_COMPLETE, { stats: result.data, symbol: result.symbol });
    } else {
      commit(types.FETCH_SYMBOL_STATS_ERROR);
    }
    return result;
  },

  resetData({ commit }) {
    commit(types.RESET_SYMBOL_INFO);
  },

  cancelRequests({ commit }) {
    StatsInfo.cancelRequests();
    commit(types.CANCEL_SYMBOL_REQUEST);
  }
};

export default actions;

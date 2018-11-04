import API from '../../services/api';
import { types } from './mutations';

const actions = {
  fetchAll: (store, { assetsIds, baseId, daysArr }) => {
    store.commit(types.FETCH_PRICES_HISTORY_REQUEST, { baseId });
    const promises = daysArr.map(days => actions.fetch(store, { assetsIds, baseId, days }));
    return Promise.all(promises).then(() => {
      store.commit(types.FETCH_PRICES_HISTORY_COMPLETE);
    }).catch(err => {
      console.log(err);
      store.commit(types.FETCH_PRICES_HISTORY_ERROR);
    });
  },
  fetch: (store, { assetsIds, baseId, days }) => {
    const { commit, rootGetters } = store;
    const assets = rootGetters['assets/getAssets'];
    const baseAsset = assets[baseId];

    commit(types.FETCH_PRICES_HISTORY_REQUEST, { baseId });
    return Promise.all(assetsIds.map(async (assetId) => {
      const prices = await API.Assets.fetchPriceHistory(baseAsset, assets[assetId], days);
      if (!prices) throw new Error('error market history');
      return {
        assetId,
        prices
      };
    })).then((pricesObjects) => {
      const prices = pricesObjects.reduce((result, obj) => {
        result[obj.assetId] = obj.prices;
        return result;
      }, {});
      commit(types.FETCH_PRICES_HISTORY_UPDATE, { days, prices });
    }).catch((err) => {
      console.log(err);
    });
  },
  resetHistory({ commit }) {
    commit(types.RESET_HISTORY);
  }
};

export default actions;

import API from '../../services/api';
import { types } from './mutations';

const actions = {
  fetch: (store, { assetsIds, baseId, days }) => {
    const { commit, rootGetters } = store;
    const assets = rootGetters['assets/getAssets'];
    const baseAsset = assets[baseId];

    commit(types.FETCH_PRICES_HISTORY_REQUEST, { baseId });
    Promise.all(assetsIds.map(async (assetId) => {
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
      commit(types.FETCH_PRICES_HISTORY_COMPLETE, { days, prices });
    }).catch((err) => {
      commit(types.FETCH_PRICES_HISTORY_ERROR);
      console.log(err);
    });
  }
};

export default actions;

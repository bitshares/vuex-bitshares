import { types } from './mutations';
import API from '../../services/api';
import { arrayToObject } from '../../utils';
import config from '../../../config';
import defaultAssets from '../../../assets';

const actions = {
  hideAsset: async ({ commit }, assetId) => {
    commit(types.HIDE_ASSET, assetId);
  },

  showAsset: async ({ commit }, assetId) => {
    commit(types.SHOW_ASSET, assetId);
  },

  /**
   * Fetches default assets objects via fetchAssets function
   to save default assets ids
   */
  fetchAssets: async (store, { assets }) => {
    const { commit, getters } = store;
    const currentAssetsIds = Object.keys(getters.getAssets);

    // filter out existing assets
    const filteredAssets = assets.filter(id => currentAssetsIds.indexOf(id) === -1);

    commit(types.FETCH_ASSETS_REQUEST);
    const result = await API.Assets.fetch(filteredAssets);

    if (result) {
      // to remove prefix specified in config (e.x. ".OPEN")
      const prefix = config.removePrefix;
      if (prefix) {
        result.forEach(asset => {
          if (asset.symbol.substring(0, prefix.length) === prefix) {
            asset.symbol = asset.symbol.slice(prefix.length);
          }
        });
      }

      const assetsById = arrayToObject(result);
      const assetsByName = arrayToObject(result, 'symbol');

      commit(types.FETCH_ASSETS_COMPLETE, { assetsById, assetsByName });
      return assetsById;
    }
    commit(types.FETCH_ASSETS_ERROR);
    return null;
  }
};

actions.fetchDefaultAssets = async ({ commit }) => {
  const result = defaultAssets.slice();
  const prefix = config.removePrefix;
  if (prefix) {
    result.forEach(asset => {
      if (asset.symbol.substring(0, prefix.length) === prefix) {
        asset.symbol = asset.symbol.slice(prefix.length);
      }
    });
  }
  const assetsById = arrayToObject(result);
  const assetsByName = arrayToObject(result, 'symbol');
  commit(types.FETCH_ASSETS_COMPLETE, { assetsById, assetsByName });
};

export default actions;

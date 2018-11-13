import Vue from 'vue';
import PersistentStorage from '../../services/persistent-storage.js';

export const types = {
  FETCH_ASSETS_REQUEST: 'FETCH_ASSETS_REQUEST',
  FETCH_ASSETS_COMPLETE: 'FETCH_ASSETS_COMPLETE',
  FETCH_ASSETS_ERROR: 'FETCH_ASSETS_ERROR',
  HIDE_ASSET: 'HIDE_ASSET',
  SHOW_ASSET: 'SHOW_ASSET',
};

export const mutations = {
  [types.FETCH_ASSETS_REQUEST](state) {
    state.pending = true;
  },
  [types.FETCH_ASSETS_COMPLETE](state, { assetsById = {}, assetsByName = {} }) {
    Object.keys(assetsById).forEach(id => {
      Vue.set(state.assets, id, assetsById[id]);
    });
    Object.keys(assetsByName).forEach(name => {
      Vue.set(state.assetsByName, name, assetsByName[name]);
    });
    state.pending = false;
  },
  [types.FETCH_ASSETS_ERROR](state) {
    state.pending = false;
  },
  [types.HIDE_ASSET](state, id) {
    state.hiddenAssetsIds.push(id);
    PersistentStorage.set('hidden_assets', state.hiddenAssetsIds);
  },
  [types.SHOW_ASSET](state, id) {
    state.hiddenAssetsIds.splice(
      state.hiddenAssetsIds.indexOf(id),
      1
    );
    PersistentStorage.set('hidden_assets', state.hiddenAssetsIds);
  }
};

import Vue from 'vue';
import PersistentStorage from '../../services/persistent-storage.js';

export const types = {
  FETCH_ASSETS_REQUEST: 'FETCH_ASSETS_REQUEST',
  FETCH_ASSETS_COMPLETE: 'FETCH_ASSETS_COMPLETE',
  FETCH_ASSETS_ERROR: 'FETCH_ASSETS_ERROR',
  FETCH_DEFAULT_ASSETS_REQUEST: 'FETCH_DEFAULT_ASSETS_REQUEST',
  FETCH_DEFAULT_ASSETS_COMPLETE: 'FETCH_DEFAULT_ASSETS_COMPLETE',
  FETCH_DEFAULT_ASSETS_ERROR: 'FETCH_DEFAULT_ASSETS_ERROR',
  HIDE_ASSET: 'HIDE_ASSET',
  SHOW_ASSET: 'SHOW_ASSET',
  SAVE_DEFAULT_ASSETS_IDS: 'SAVE_DEFAULT_ASSETS_IDS'
};

export const mutations = {
  [types.FETCH_ASSETS_REQUEST](state) {
    state.pending = true;
  },
  [types.FETCH_ASSETS_COMPLETE](state, { assets }) {
    Object.keys(assets).forEach(id => {
      Vue.set(state.assets, id, assets[id]);
    });
    state.hiddenAssetsIds = PersistentStorage.getJSON('hidden_assets') || [];
    state.pending = false;
  },
  [types.FETCH_ASSETS_ERROR](state) {
    state.pending = false;
  },
  [types.SAVE_DEFAULT_ASSETS_IDS](state, { ids }) {
    state.defaultAssetsIds = ids;
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

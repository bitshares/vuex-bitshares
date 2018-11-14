import Vue from 'vue';
import { getDefaultState } from './defaultState';

export const types = {
  ACCOUNT_CLOUD_LOGIN: 'ACCOUNT_CLOUD_LOGIN',
  ACCOUNT_BRAINKEY_LOGIN: 'ACCOUNT_BRAINKEY_LOGIN',
  ACCOUNT_SIGNUP: 'ACCOUNT_SIGNUP',
  ACCOUNT_LOGOUT: 'ACCOUNT_LOGOUT',
  ACCOUNT_LOCK_WALLET: 'ACCOUNT_LOCK_WALLET',
  ACCOUNT_UNLOCK_WALLET: 'ACCOUNT_UNLOCK_WALLET',
  FETCH_CURRENT_USER: 'FETCH_CURRENT_USER',
  STORE_BACKUP_DATE: 'STORE_BACKUP_DATE'
};

export const mutations = {
  [types.ACCOUNT_CLOUD_LOGIN]: (state, { userId, keys }) => {
    state.userId = userId;
    state.keys = keys;
    state.userType = 'password';
  },
  [types.ACCOUNT_BRAINKEY_LOGIN]: (state, { wallet, userId }) => {
    state.userId = userId;
    state.wallet.passwordPubkey = wallet.passwordPubkey;
    state.wallet.encryptedBrainkey = wallet.encryptedBrainkey;
    state.wallet.encryptionKey = wallet.encryptionKey;
    state.wallet.aesPrivate = wallet.aesPrivate;
    state.userType = 'wallet';
  },
  [types.ACCOUNT_SIGNUP]: (state, { wallet, userId }) => {
    state.userId = userId;
    state.wallet.passwordPubkey = wallet.passwordPubkey;
    state.wallet.encryptedBrainkey = wallet.encryptedBrainkey;
    state.wallet.encryptionKey = wallet.encryptionKey;
    state.wallet.aesPrivate = wallet.aesPrivate;
    state.userType = 'wallet';
  },
  [types.ACCOUNT_LOGOUT]: (state) => {
    Object.assign(state, getDefaultState());
  },
  [types.ACCOUNT_LOCK_WALLET]: (state) => {
    state.wallet.aesPrivate = null;
    state.keys = null;
  },
  [types.ACCOUNT_UNLOCK_WALLET]: (state, aesPrivate) => {
    state.wallet.aesPrivate = aesPrivate;
  },
  [types.FETCH_CURRENT_USER]: (state, { data }) => {
    Vue.set(state, 'userData', data);
  },
  [types.STORE_BACKUP_DATE]: (state, date) => {
    state.backupDate = date;
  }
};

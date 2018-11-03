import { PrivateKey, key } from 'bitsharesjs';

const ACTIVE_KEY_INDEX = 0;
const OWNER_KEY_INDEX = 1;

const getters = {
  getBrainkey: state => {
    if (!state.aesPrivate) return null;
    return state.aesPrivate.decryptHexToText(state.encryptedBrainkey);
  },

  getKeys: state => {
    if (state.keys) {
      return state.keys;
    }
    const brainkey = getters.getBrainkey(state);
    if (!brainkey) return null;
    return {
      active: key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX),
      owner: key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX)
    };
  },

  isValidPassword: state => {
    return password => {
      const passwordPrivate = PrivateKey.fromSeed(password);
      const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();
      return passwordPubkey === state.passwordPubkey;
    };
  },

  isLocked: state => {
    return !state.aesPrivate && !state.keys;
  },

  getAccountError: state => {
    return state.error;
  },

  getAccountUserId: state => {
    return state.userId;
  },

  getAccountPendingState: state => {
    return state.pending;
  },

  getOperations: state => {
    return state.operations;
  },

  getAccountOperationsPendingState: state => {
    return state.operationsPending;
  },

  getCurrentUserName: state => {
    return state.userData && state.userData.account.name;
  },

  getCurrentUserBalances: state => {
    return (state.userData && state.userData.balances) || {};
  },

  getCurrentUserData: state => {
    return state.userData;
  },

  isPasswordLogin: state => state.userType === 'password'
};

export default getters;

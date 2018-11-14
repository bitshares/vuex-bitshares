import { key, PrivateKey } from 'bitsharesjs';

const getters = {
  getAccountUserId: state => {
    return state.userId;
  },
  getBrainkey: state => {
    if (!state.wallet.aesPrivate) return null;
    return state.wallet.aesPrivate.decryptHexToText(state.wallet.encryptedBrainkey);
  },
  getCurrentUserName: state => {
    return state.userData && state.userData.account.name;
  },
  getUserBalances: state => {
    if (!state.userData || !state.userData.balances) return {};
    const { balances } = state.userData;
    const nonZeroBalances = Object.keys(balances).reduce((result, assetId) => {
      if (balances[assetId].balance) result[assetId] = balances[assetId];
      return result;
    }, {});
    return nonZeroBalances;
  },
  isLocked: state => {
    return !state.wallet.aesPrivate && (!state.keys.active || !state.keys.owner);;
  },
  isLoggedIn: state => !!state.userId,
  isValidPassword: state => {
    return password => {
      const passwordPrivate = PrivateKey.fromSeed(password);
      const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();
      return passwordPubkey === state.wallet.passwordPubkey;
    };
  },
  getKeys: state => {
    if (state.keys && state.keys.active && state.keys.owner) {
      return state.keys;
    }
    if (!state.wallet || !state.wallet.aesPrivate) return null;
    const brainkey = state.wallet.aesPrivate.decryptHexToText(state.wallet.encryptedBrainkey);
    if (!brainkey) return null;
    return {
      active: key.get_brainPrivateKey(brainkey, 0),
      owner: key.get_brainPrivateKey(brainkey, 1)
    };
  }
};

export default getters;

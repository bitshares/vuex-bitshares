// temp
import { Aes } from 'bitsharesjs';
import { format } from 'date-fns';
import API from '../../services/api';
import { types } from './mutations';
import { removePrefix, getFloatCurrency } from '../../utils';

// utils func -> move to utils
const balancesToObject = (balancesArr) => {
  const obj = {};
  balancesArr.forEach(item => {
    obj[item.asset_type] = item;
  });
  return obj;
};

const parseOpenOrders = (orders, rootGetters) => {
  const parsedActiveOrders = orders.map(order => {
    // need to get if from somewhere
    const isBid = true;

    const payInSellPrice = isBid ? order.sell_price.base : order.sell_price.quote;
    const payAssetId = payInSellPrice.asset_id;
    const payAsset = rootGetters['assets/getAssetById'](payAssetId);

    const receiveInSellPrice = isBid ? order.sell_price.quote : order.sell_price.base;
    const receiveAssetId = receiveInSellPrice.asset_id;
    const receiveAsset = rootGetters['assets/getAssetById'](receiveAssetId);

    const get = getFloatCurrency(isBid
      ? parseFloat(receiveInSellPrice.amount) / (10 ** receiveAsset.precision)
      : parseFloat(payInSellPrice.amount) / (10 ** payAsset.precision));
    const spend = getFloatCurrency(isBid
      ? parseFloat(payInSellPrice.amount) / (10 ** payAsset.precision)
      : parseFloat(receiveInSellPrice.amount) / (10 ** receiveAsset.precision));

    const payAssetSymbol = isBid ? removePrefix(payAsset.symbol) : removePrefix(receiveAsset.symbol);
    const receiveAssetSymbol = isBid ? removePrefix(receiveAsset.symbol) : removePrefix(payAsset.symbol);
    const filled = getFloatCurrency(
      (order.sell_price.base.amount - order.for_sale) / (order.sell_price.base.amount)
    );

    const price = getFloatCurrency(isBid
      ? parseFloat(spend / get)
      : parseFloat(get / spend));

    const expiration = (new Date(order.expiration)).getTime();
    const expiringDate = format(expiration, 'DD/MM/YY');
    const expiringTime = format(expiration, 'HH:mm');

    return {
      payAssetSymbol,
      receiveAssetSymbol,
      expiringDate,
      expiringTime,
      get,
      order: isBid ? 'buy' : 'sell',
      vol: isBid ? get : spend,
      spend,
      price,
      filled,
      orderId: order.id
    };
  });
  return parsedActiveOrders;
};

const actions = {
  /**
   * Logs in with password
   * @param {string} name - username
   * @param {string} password - user password
   */
  cloudLogin: async ({ commit }, { name, password }) => {
    // keys: { active, owner }
    const keys = API.Account.utils.generateKeysFromPassword({ name, password });
    const ownerPubkey = keys.owner.toPublicKey().toPublicKeyString('BTS');
    const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);
    const id = userId && userId[0];
    if (id) {
      commit(types.ACCOUNT_CLOUD_LOGIN, { keys, userId: id });
      return { error: false };
    }
    return {
      error: true,
      message: 'Invalid username or password'
    };
  },

  /**
   * Logs in with brainkey & creates wallet
   * @param {string} password - user password
   * @param {string} brainkey - user brainkey
   */
  brainkeyLogin: async ({ commit }, { password, brainkey }) => {
    const userId = await API.Account.getAccountIdByBrainkey(brainkey);
    const id = userId && userId[0];

    if (id) {
      const wallet = API.Account.utils.createWallet({ password, brainkey });
      commit(types.ACCOUNT_BRAINKEY_LOGIN, {
        userId: id,
        wallet
      });
      return { error: false };
    }
    return { error: true };
  },

  /**
  * Logs in with brainkey & creates wallet
  * @param {string} backup - parsed backup file
  * @param {string} password - password
  */
  fileLogin: async ({ commit }, { backup, password }) => {
    const restored = await API.Backup.restoreBackup({ backup, password });
    if (!restored.success) return { success: false, error: restored.error };
    const {
      wallet: [wallet],
      linked_accounts: [{ name }]
    } = restored.wallet;

    const passwordAes = Aes.fromSeed(password);
    const encryptionPlainbuffer = passwordAes.decryptHexToBuffer(wallet.encryption_key);
    const aesPrivate = Aes.fromSeed(encryptionPlainbuffer);

    const brainkey = aesPrivate.decryptHexToText(wallet.encrypted_brainkey);

    const newWallet = API.Account.utils.createWallet({ password, brainkey });

    const user = await API.Account.getUser(name);
    if (user.success) {
      commit(types.ACCOUNT_BRAINKEY_LOGIN, {
        userId: user.data.account.id,
        wallet: newWallet
      });
      return { success: true };
    }
    return { success: false, error: 'No such user' };
  },

  /**
   * Signs up and logs in with username and password
   * @param {string} name - username
   * @param {string} password - user password
   */
  signupWithPassword: async ({ commit }, { name, password }) => {
    const keys = API.Account.utils.generateKeysFromPassword({ name, password });
    const result = await API.Account.createAccount({
      name,
      activeKey: keys.active,
      ownerKey: keys.owner
    });

    if (result.success) {
      const userId = result.id;
      const userType = 'password';

      commit(types.ACCOUNT_CLOUD_LOGIN, { keys, userId, userType });
      return { error: false };
    }

    return {
      error: true,
      message: result.error
    };
  },

  /**
 * Creates account & wallet for user
 * @param {string} name - user name
 * @param {string} password - user password
 * @param {string} dictionary - string to generate brainkey from
 */
  signupBrainkey: async ({ commit }, { name, password, dictionary, email }) => {
    const brainkey = API.Account.utils.suggestBrainkey(dictionary);
    const result = await API.Account.createAccountBrainkey({
      name,
      email,
      brainkey
    });
    if (result.success) {
      const userId = result.id;
      const wallet = API.Account.utils.createWallet({ password, brainkey });
      commit(types.ACCOUNT_SIGNUP, { wallet, userId });

      return { error: false };
    }
    return {
      error: true,
      message: result.error
    };
  },

  logout: ({ commit }) => {
    commit(types.ACCOUNT_LOGOUT);
  },

  fetchCurrentUser: async (store) => {
    const { commit, getters, rootGetters } = store;
    const userId = getters.getAccountUserId;
    if (!userId) return;
    const result = await API.Account.getUser(userId);
    if (result.success) {
      const user = result.data;
      result.data.balances = balancesToObject(user.balances);
      user.limit_orders = parseOpenOrders(user.limit_orders, rootGetters);
      commit(types.FETCH_CURRENT_USER, { data: user });
    }
  },

  storeBackupDate: ({ commit }) => {
    commit(types.STORE_BACKUP_DATE, new Date());
  },

  /**
   * Unlocks user's wallet via provided password
   * @param {string} password - user password
   */
  unlockWallet: ({ commit, state }, password) => {
    const passwordAes = Aes.fromSeed(password);
    const encryptionPlainbuffer = passwordAes.decryptHexToBuffer(state.wallet.encryptionKey);
    const aesPrivate = Aes.fromSeed(encryptionPlainbuffer);
    commit(types.ACCOUNT_UNLOCK_WALLET, aesPrivate);
  },

  /**
   * Locks user's wallet
   */
  lockWallet: ({ commit }) => {
    commit(types.ACCOUNT_LOCK_WALLET);
  }
};


export default actions;

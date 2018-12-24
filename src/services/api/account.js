import { key, PrivateKey, Aes, PublicKey } from 'bitsharesjs';
import { Apis } from 'bitsharesjs/node_modules/bitsharesjs-ws';
// import * as fs from 'fs';
import config from '../../../config';
import lib from '../../utils/lzma/lzma_worker-min.js';

const OWNER_KEY_INDEX = 1;
const ACTIVE_KEY_INDEX = 0;

export const utils = {
  suggestPassword: () => {
    return 'P' + key.get_random_key().toWif().substr(0, 45);
  },
  suggestBrainkey: (dictionary) => {
    return key.suggest_brain_key(dictionary);
  },
  generateKeyFromPassword: (accountName, role, password) => {
    const seed = accountName + role + password;
    const privKey = PrivateKey.fromSeed(seed);
    const pubKey = privKey.toPublicKey().toString();

    return { privKey, pubKey };
  },

  generateKeysFromPassword({ name, password }) {
    const { privKey: activeKey } = this.generateKeyFromPassword(
      name,
      'owner',
      password
    );
    const { privKey: ownerKey } = this.generateKeyFromPassword(
      name,
      'active',
      password
    );
    return {
      active: activeKey,
      owner: ownerKey
    };
  },

  getOwnerPubkeyFromBrainkey: (brainkey) => {
    const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
    const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString('BTS');
    return ownerPubkey;
  },

  encodeBody: (params) => {
    return Object.keys(params).map((bodyKey) => {
      return encodeURIComponent(bodyKey) + '=' + encodeURIComponent(params[bodyKey]);
    }).join('&');
  },

  createWallet: ({ brainkey, password }) => {
    const passwordAes = Aes.fromSeed(password);
    const encryptionBuffer = key.get_random_key().toBuffer();
    const encryptionKey = passwordAes.encryptToHex(encryptionBuffer);
    const aesPrivate = Aes.fromSeed(encryptionBuffer);

    const normalizedBrainkey = key.normalize_brainKey(brainkey);
    const encryptedBrainkey = aesPrivate.encryptToHex(normalizedBrainkey);
    const passwordPrivate = PrivateKey.fromSeed(password);
    const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();

    return {
      passwordPubkey,
      encryptionKey,
      encryptedBrainkey,
      aesPrivate,
    };
  }
};


export const getUser = async (nameOrId) => {
  try {
    const response = await Apis.instance().db_api().exec('get_full_accounts', [[nameOrId], false]);
    if (response && response[0]) {
      const user = response[0][1];
      return {
        success: true,
        data: user
      };
    }
    return {
      success: false,
      error: 'User not found'
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
};

export const getAccountIdByOwnerPubkey = async ownerPubkey => {
  const res = await Apis.instance().db_api().exec('get_key_references', [[ownerPubkey]]);
  return res ? res[0] : null;
};

export const getAccountIdByBrainkey = async brainkey => {
  const ownerPubkey = utils.getOwnerPubkeyFromBrainkey(brainkey);
  return getAccountIdByOwnerPubkey(ownerPubkey);
};

export const createAccountTrusty = async ({ name, activeKey, ownerKey, email }) => {
  const { faucetUrl } = config;
  try {
    const body = {
      name,
      email,
      active_key: activeKey.toPublicKey().toPublicKeyString('BTS'),
      owner_key: ownerKey.toPublicKey().toPublicKeyString('BTS')
    };
    const response = await fetch(faucetUrl, {
      method: 'post',
      mode: 'cors',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      body: utils.encodeBody(body)
    });
    const result = await response.json();
    if (result.result === 'OK') {
      return {
        success: true,
        id: result.id
      };
    }
    return {
      success: false,
      error: result.result
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
};

export const createAccount = async ({ name, ownerKey, activeKey }) => {
  const { bbfFaucetUrl, bbfRegisterationUser } = config;
  try {
    const response = await fetch(bbfFaucetUrl + '/api/v1/accounts', {
      method: 'post',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        account: {
          name,
          owner_key: ownerKey.toPublicKey().toPublicKeyString('BTS'),
          active_key: activeKey.toPublicKey().toPublicKeyString('BTS'),
          memo_key: activeKey.toPublicKey().toPublicKeyString('BTS'),
          refcode: null,
          bbfRegisterationUser
        }
      })
    });
    const result = await response.json();
    if (!result || (result && result.error)) {
      return {
        success: false,
        error: result.error.base[0]
      };
    }
    const { account } = result;
    const fullAccount = await Apis.instance().db_api().exec('get_account_by_name', [account.name]);
    const { id } = fullAccount;

    return {
      success: true,
      id
    };
  } catch (error) {
    return {
      success: false,
      error: 'Account creation error'
    };
  }
};

export const createAccountBrainkey = async ({ name, brainkey, email }) => {
  const activeKey = key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX);
  const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
  return createAccount({ name, activeKey, ownerKey, email });
};

function createWalletBackup(
  passwordPubkey,
  walletObject,
  compressionMode,
  entropy
) {
  return new Promise(resolve => {
    const publicKey = PublicKey.fromPublicKeyString(passwordPubkey);
    const onetimePrivateKey = key.get_random_key(entropy);
    const walletString = JSON.stringify(walletObject, null, 0);
    lib.LZMA_WORKER.compress(walletString, compressionMode, compressedWalletBytes => {
      const backupBuffer = Aes.encrypt_with_checksum(
        onetimePrivateKey,
        publicKey,
        null /* nonce */,
        compressedWalletBytes
      );

      const onetimePublicKey = onetimePrivateKey.toPublicKey();
      const backup = Buffer.concat([
        onetimePublicKey.toBuffer(),
        backupBuffer
      ]);
      resolve(backup);
    });
  });
}

export const generateBackupBlob = async ({ brainkey, password, name }) => {
  const passwordPrivate = PrivateKey.fromSeed(password);
  const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();

  const brainkeyPrivate = PrivateKey.fromSeed(key.normalize_brainKey(brainkey));
  const brainkeyPubkey = brainkeyPrivate.toPublicKey().toPublicKeyString();

  const passwordAes = Aes.fromSeed(password);
  const encryptionBuffer = key.get_random_key().toBuffer();
  const encryptionKey = passwordAes.encryptToHex(encryptionBuffer);
  const localAesPrivate = Aes.fromSeed(encryptionBuffer);

  const encryptedBrainkey = localAesPrivate.encryptToHex(brainkey);

  const date = new Date();

  const walletObject = {
    linked_accounts: [{
      name,
      chainId: config.MAIN_NET_CHAINID
    }],
    wallet: [{
      backup_date: date.toString(),
      brainkey_backup_date: date,
      brainkey_pubkey: brainkeyPubkey,
      brainkey_sequence: 0,
      chain_id: config.MAIN_NET_CHAINID,
      created: date,
      encrypted_brainkey: encryptedBrainkey,
      encryption_key: encryptionKey,
      id: 'default',
      last_modified: date,
      password_pubkey: passwordPubkey,
      public_name: 'default',
    }]
  };

  const blob = await createWalletBackup(passwordPubkey, walletObject, 1);
  return blob;
};

export default {
  utils,
  getUser,
  getAccountIdByOwnerPubkey,
  getAccountIdByBrainkey,
  createAccount,
  createAccountBrainkey,
  generateBackupBlob
};

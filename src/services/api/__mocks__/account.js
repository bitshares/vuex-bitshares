import { key, PrivateKey, Aes } from 'bitsharesjs';

const suggestedBrainkey = 'glink omental webless pschent knopper brumous '
  + 'scarry were wasting isopod raper barbas maco kirn tegua mitome';

const users = ['hobb1t'];


export const utils = {
  suggestBrainkey: () => {
    return suggestedBrainkey;
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
  },
};

export const getUser = async (nameOrId) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (nameOrId === 'hobb1t' || nameOrId === '1.2.512210') {
        resolve({
          success: true,
          data: {
            account: {
              id: '1.2.512210'
            },
            balances: [
              {
                id: '2.5.255580',
                owner: '1.2.512210',
                asset_type: '1.3.0',
                balance: 3092178,
                maintenance_flag: false
              },
              {
                id: '2.5.255586',
                owner: '1.2.512210',
                asset_type: '1.3.850',
                balance: 698,
                maintenance_flag: false
              }
            ],
            limit_orders: []
          }
        });
      }
      resolve({
        success: users.includes(nameOrId)
      });
    });
  });
};

export const getAccountIdByOwnerPubkey = ownerPubkey => {
  return new Promise((resolve) => {
    if (ownerPubkey === 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX') {
      resolve(['1.2.512210']);
    } else if (ownerPubkey === 'BTS8TwrNmds9iWiEAAiEiLneMg1S3Qe3EC3wHJFHkLSzjFJiPov5q') {
      resolve(['1.2.1209196']);
    } else {
      resolve({
        success: false
      });
    }
  });
};

export const createAccount = ({ name }) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (name === 'hobb1t') {
        resolve({
          success: true,
          id: '1.2.512210'
        });
      } else {
        resolve({
          success: false
        });
      }
    });
  });
};

export const createAccountBrainkey = ({ name }) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (name === 'hobb1t') {
        resolve({
          success: true,
          id: '1.2.512210'
        });
      } else {
        resolve({
          success: false
        });
      }
    });
  });
};

const brainkeyForAccountId = 'brinjal gardy brulee lotic athymia onstead reopen dance reking arisard stylish '
  + 'retaker assuage anywise dyaster skiddoo';
export const getAccountIdByBrainkey = async (brainkey) => {
  return new Promise((resolve) => {
    if (brainkey === brainkeyForAccountId) {
      resolve(['1.2.1209224']);
    } else {
      resolve({
        success: false
      });
    }
  });
};

export default {
  utils, getUser, getAccountIdByOwnerPubkey, createAccount, getAccountIdByBrainkey, createAccountBrainkey
};

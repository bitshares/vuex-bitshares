import { PrivateKey } from 'bitsharesjs';

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
};

export const getUser = async (nameOrId) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
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


export default {
  utils, getUser, getAccountIdByOwnerPubkey, createAccount
};

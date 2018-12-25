import { utils } from '../account';

const brainkey = 'pheon dasi costar paler cooing pondman panurgy burton grike '
  + 'sculpt midnoon samara dermis derrick kurung femoral';

export const restoreBackup = ({ backup, password }) => {
  return new Promise((resolve) => {
    if (password === 'hzhzhz' && backup === 'hobb1t_backup_wif') {
      const wallet = utils.createWallet({ password, brainkey });
      wallet.encrypted_brainkey = wallet.encryptedBrainkey;
      wallet.encryption_key = wallet.encryptionKey;
      wallet.encrypted_brainkey = wallet.encryptedBrainkey;
      resolve({ wallet: { wallet: [wallet], linked_accounts: [{ name: 'hobb1t' }] }, success: true });
    } else {
      resolve(new Error());
    }
  });
};

export default {
  restoreBackup
};

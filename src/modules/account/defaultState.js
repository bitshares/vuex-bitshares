export const getDefaultState = () => {
  return {
    passwordPubkey: null,
    encryptedBrainkey: null,
    brainkeyBackupDate: null,
    encryptionKey: null,
    keys: null,
    created: null,
    aesPrivate: null,
    userId: null,
    error: null,
    pending: false,
    userData: null,
    userFetching: false,
    userError: false,
    userType: 'wallet',
  };
};

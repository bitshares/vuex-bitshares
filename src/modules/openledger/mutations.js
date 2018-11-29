export const types = {
  FETCH_OPENLEDGER_DEPOSIT_ADDRESS_REQUEST: 'FETCH_OPENLEDGER_DEPOSIT_ADDRESS_REQUEST',
  FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE: 'FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE',
  FETCH_OPENLEDGER_DEPOSIT_ADDRESS_ERROR: 'FETCH_OPENLEDGER_DEPOSIT_ADDRESS_ERROR',
  FETCH_OPENLEDGER_COINS_REQUEST: 'FETCH_OPENLEDGER_COINS_REQUEST',
  FETCH_OPENLEDGER_COINS_COMPLETE: 'FETCH_OPENLEDGER_COINS_COMPLETE',
  FETCH_OPENLEDGER_COINS_ERROR: 'FETCH_OPENLEDGER_COINS_ERROR'
};

export const mutations = {
  [types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_REQUEST]: (state) => {
    state.pendingAddress = true;
    state.depositAddress = {};
    state.error = null;
  },
  [types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE]: (state, { address }) => {
    state.depositAddress = address;
    state.pendingAddress = false;
  },
  [types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_ERROR]: (state, { error }) => {
    state.error = error;
    state.depositAddress = {};
    state.pendingAddress = false;
  },
  [types.FETCH_OPENLEDGER_COINS_REQUEST]: (state) => {
    state.pending = true;
  },
  [types.FETCH_OPENLEDGER_COINS_COMPLETE]: (state, { coins }) => {
    state.pending = false;
    state.coins = coins;
  },
  [types.FETCH_OPENLEDGER_COINS_ERROR]: (state, { error }) => {
    state.pending = false;
    state.error = error;
  }
};

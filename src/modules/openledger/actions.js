import API from '../../services/api';
import { types } from './mutations';

const actions = {
  async checkIfAddressIsValid(state, { asset, address }) {
    const valid = await API.Openledger.validateAddress({ asset, address });
    return valid;
  },
  async fetchDepositAddress(store, { asset }) {
    const { commit, rootGetters, getters } = store;
    const user = rootGetters['acc/getCurrentUserName'];

    commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_REQUEST);

    const cachedAddresses = getters.getDepositAddress;
    if (cachedAddresses[asset]) {
      const address = cachedAddresses[asset];
      commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE, { address });
    } else {
      console.log('LOAD', asset, user);
      const lastAddress = await API.Openledger.getLastDepositAddress({
        asset,
        user
      });
      if (lastAddress.success) {
        const address = lastAddress.data;
        cachedAddresses[asset] = address;
        commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE, { address });
      } else {
        const newAddress = await API.Openledger.requestDepositAddress({
          asset,
          user
        });

        if (newAddress.success) {
          const address = newAddress.data;
          cachedAddresses[asset] = address;
          commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE, { address });
        } else {
          const { error } = lastAddress;
          commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_ERROR, { error });
        }
      }
    }
  },
  async fetchCoins({ state, commit }) {
    commit(types.FETCH_OPENLEDGER_COINS_REQUEST);

    if (state.coins) {
      commit(types.FETCH_OPENLEDGER_COINS_COMPLETE, { coins: state.coins });
      return;
    }

    const fetchResult = await API.Openledger.fetchCoins();


    if (!fetchResult.success) {
      const { error } = fetchResult;
      commit(types.FETCH_OPENLEDGER_COINS_ERROR, { error });
    }

    const coins = {};

    fetchResult.data.forEach((coin) => {
      const { coinType, gateFee, intermediateAccount } = coin;
      coins[coinType] = { gateFee, intermediateAccount };
    });

    commit(types.FETCH_OPENLEDGER_COINS_COMPLETE, { coins });
  }
};

export default actions;

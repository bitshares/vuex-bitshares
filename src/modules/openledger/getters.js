const getters = {
  getDepositAddress: state => state.depositAddress,
  getCoinsData: state => state.coins,
  getAddressPending: state => state.pendingAddress,
  getCoinsPending: state => state.pending
};

export default getters;

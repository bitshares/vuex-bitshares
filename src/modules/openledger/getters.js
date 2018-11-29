const getters = {
  getDepositAddress: state => state.depositAddress,
  getCoinsData: state => state.coins,
  getAddressPending: state => state.pendingAddress
};

export default getters;

const getters = {
  /**
   * Returns current user's name string
   */
  getUserName: ({ account }) => {
    return account && account.name;
  },

  /**
   * Returns current user's account object
   */
  getAccountObject: ({ account }) => {
    return account;
  },

  /**
   * Returns current users's balances object
   */
  getBalances: ({ balances }) => {
    return balances;
  },

  /**
   * User fetching in progress indicator
   */
  isFetching: (state) => {
    return state.fetching;
  }
};

export default getters;

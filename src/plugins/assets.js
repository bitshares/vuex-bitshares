const fetchingAssets = store => {
  store.subscribe((mutation, state) => {
    if (mutation.type === 'acc/FETCH_CURRENT_USER') {
      const assets = Object.keys(mutation.payload.data.balances);
      store.dispatch('assets/fetchAssets', { assets }, { root: true });
    }
  });
};

export default fetchingAssets;

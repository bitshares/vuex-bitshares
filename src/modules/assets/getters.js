const getters = {
  /**
   * Returns object with all assets
   */
  getAssets: ({ assets }) => {
    return assets || {};
  },

  /**
   * Returns array with default assets ids
   */
  getDefaultAssetsIds: ({ defaultAssetsIds }) => {
    return defaultAssetsIds;
  },

  /**
   * Returns function to get asset by id
   */
  getAssetById: ({ assets }) => {
    return (id) => ((assets && assets[id]) ? assets[id] : {
      symbol: '...',
      precision: 1
    });
  },

  getHideList: ({ hiddenAssetsIds }) => {
    return hiddenAssetsIds;
  }
};

export default getters;

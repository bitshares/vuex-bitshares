const getters = {
  getByDay: state => {
    return (days) => {
      return state.days[days] || {};
    };
  },
  isFetching: state => state.fetching,
  initialLoaded: state => state.initLoaded,
  getAssetHistoryByDay: state => {
    return (id, day) => {
      if (!state.days[day]) return { first: 0, last: 0 };
      return state.days[day][id] || { first: 0, last: 0 };
    };
  },
  getHistoryAssetMultiplier: state => {
    return (days, assetId) => {
      if (!state.days[days] || !state.days[days][assetId]) {
        return {
          first: 0,
          last: 0
        };
      }
      return {
        first: 1 / state.days[days][assetId].first,
        last: 1 / state.days[days][assetId].last
      };
    };
  }
};

export default getters;

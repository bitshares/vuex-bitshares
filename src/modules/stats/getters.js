const getters = {
  getStats: state => state.stats,
  getPendingStats: state => state.pendingStats,
  // return function to get stats by market symbol
  getStatsById: ({ stats }) => {
    return (symbol) => ((stats && stats[symbol]) ? stats[symbol] : {
      marketcap: 0,
      closeYearDiff: 0,
      openYearDiff: 0,
    });
  },
};

export default getters;

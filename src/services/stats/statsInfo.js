import axios from 'axios';

class StatsInfo {
  constructor() {
    this.weeks52InMs = 31449600000;
    this.cancelToken = axios.CancelToken;
  }

  async getStats(quoteSymbol, baseSymbol = 'USD') {
    const statsQuery = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${quoteSymbol}`
      + `&tsyms=${baseSymbol}&e=CCCAGG`;

    const changeQuery = `https://min-api.cryptocompare.com/data/histoday?fsym=${quoteSymbol}`
      + `&tsym=${baseSymbol}&limit=354`;

    try {
      this.sourceStats = this.cancelToken.source();
      this.changes = this.cancelToken.source();
      const statsResponse = await axios.get(statsQuery, {
        cancelToken: this.sourceStats.token
      });
      const changeResponse = await axios.get(changeQuery, {
        cancelToken: this.changes.token
      });

      if (statsResponse.data.Response !== 'Error' && changeResponse.data.Response === 'Success') {
        const marketcap = statsResponse.data.DISPLAY[quoteSymbol].USD.MKTCAP;
        if (!changeResponse.data.Data.length) {
          return {
            success: false,
            error: 'no stats for this pair'
          };
        }

        const { open: yearAgoOpen, close: yearAgoClose } = changeResponse.data.Data[0];
        const {
          open: nowOpen,
          close: nowClose
        } = changeResponse.data.Data[changeResponse.data.Data.length - 1];

        const closeYearDiff = nowClose > yearAgoClose
          ? '+' + (((nowClose - yearAgoClose) / yearAgoClose) * 100).toFixed(2)
          : '-' + (((yearAgoClose - nowClose) / yearAgoClose) * 100).toFixed(2);
        const openYearDiff = nowOpen > yearAgoOpen
          ? '+' + (((nowOpen - yearAgoOpen) / yearAgoOpen) * 100).toFixed(2)
          : '-' + (((yearAgoOpen - nowOpen) / yearAgoOpen) * 100).toFixed(2);

        console.log(closeYearDiff);
        console.log(openYearDiff);

        const stats = {
          marketcap,
          closeYearDiff,
          openYearDiff
        };
        const symbol = quoteSymbol + baseSymbol;
        return {
          success: true,
          stats,
          symbol
        };
      }
      return {
        success: false,
        error: statsResponse.data.Message
      };
    } catch (error) {
      const result = {
        success: false,
        error: ''
      };
      if (axios.isCancel(error)) {
        result.error = 'request canceled';
      } else {
        result.error = error;
      }
      return result;
    }
  }

  cancelRequests() {
    if (this.sourceStats) this.sourceStats.cancel('canceled request');
    if (this.changes) this.changes.cancel('canceled request');
  }
}

export default new StatsInfo();

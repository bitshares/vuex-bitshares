import { Apis } from 'bitsharesjs/node_modules/bitsharesjs-ws';
import defaultAssets from '../../../assets';
import { arrayToObject } from '../../utils';

const assets = arrayToObject(defaultAssets, 'symbol');

const precisedCount = (cnt, prec) => cnt / (10 ** prec);

const getStatsForPeriodAndInteval = (base, quote, bucket, days) => {
  const endDate = new Date();
  const startDate = new Date(endDate - (1000 * 60 * 60 * 24 * days));
  const endDateISO = endDate.toISOString().slice(0, -5);
  const startDateISO = startDate.toISOString().slice(0, -5);
  return Apis.instance().history_api().exec(
    'get_market_history',
    [base.id, quote.id, bucket, startDateISO, endDateISO]
  ).then((result) => {
    return {
      asset: quote,
      data: result
    };
  });
};

const hourlyStatsInDailyBuckets = (base, quote) => {
  const bucketSize = 86400;
  const days = 7;
  return getStatsForPeriodAndInteval(base, quote, bucketSize, days);
};

const getPricesFromBucket = (basePrecision, quotePrecision, bucket) => {
  const closeCountBase = precisedCount(bucket.close_base, basePrecision);
  const closeCountQuote = precisedCount(bucket.close_quote, quotePrecision);
  const openCountBase = precisedCount(bucket.open_base, basePrecision);
  const openCountQuote = precisedCount(bucket.open_quote, quotePrecision);
  return {
    open: openCountBase / openCountQuote,
    close: closeCountBase / closeCountQuote
  };
};


export const getFiatMultiplier = async (base, fiat) => {
  if (base.symbol === fiat.symbol) {
    return {
      median: 1,
      last: 1
    };
  }
  const bucketSize = 3600;
  const endDate = new Date();
  const startDate = new Date(endDate - (1000 * 60 * 60 * 24));
  const endDateISO = endDate.toISOString().slice(0, -5);
  const startDateISO = startDate.toISOString().slice(0, -5);

  const fiatBuckets = await Apis.instance().history_api().exec(
    'get_market_history',
    [base.id, fiat.id, bucketSize, startDateISO, endDateISO]
  );

  const result = {
    median: 0,
    last: 0
  };

  if (fiatBuckets.length) {
    const firstBucket = fiatBuckets[0];
    const lastBucket = fiatBuckets[fiatBuckets.length - 1];
    const { open } = getPricesFromBucket(base.precision, fiat.precision, firstBucket);
    const { close } = getPricesFromBucket(base.precision, fiat.precision, lastBucket);
    const medianPrice = (open + close) / 2;

    result.median = medianPrice;
    result.last = close;
  }
  return result;
};

export const getMarketChanges7d = async (base, quotes) => {
  const baseAsset = assets[base];
  const rawData = await Promise.all(quotes.map(
    quote => hourlyStatsInDailyBuckets(baseAsset, assets[quote])
  ));

  const result = {};
  rawData.forEach(({ asset, data }) => {
    if (!data.length) {
      result[asset.symbol] = 0;
      return;
    }
    const firstBucket = data[0];
    const lastBucket = data[data.length - 1];
    const firstPrices = getPricesFromBucket(baseAsset.precision, asset.precision, firstBucket);
    const lastPrices = getPricesFromBucket(baseAsset.precision, asset.precision, lastBucket);
    const priceDecrease = lastPrices.close - firstPrices.open;
    const change = (priceDecrease * 100) / lastPrices.close;
    result[asset.symbol] = change.toFixed(2);
  });
  return result;
};


export default { getMarketChanges7d, getFiatMultiplier };

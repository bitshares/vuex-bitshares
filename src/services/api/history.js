import { Apis } from 'bitsharesjs-ws';
import defaultAssets from '../../../assets';
import { arrayToObject } from '../../utils';

const assets = arrayToObject(defaultAssets, 'symbol');

const precisedCount = (cnt, prec) => cnt / (10 ** prec);

// It returns open and close prices for given bucket with base and quote precisions
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

const getUsdPrices = (basePrecision, usdPrecision, usdFirstBucket, usdLastBucket) => {
  const { open: usdOpenPrice } = getPricesFromBucket(basePrecision, usdPrecision, usdFirstBucket);
  const { close: usdClosePrice } = getPricesFromBucket(basePrecision, usdPrecision, usdLastBucket);
  const medianPrice = (usdOpenPrice + usdClosePrice) / 2;
  return {
    last: usdClosePrice,
    median: medianPrice
  };
};

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

const dailyStatsInHourBuckets = (base, quote) => {
  const bucketSize = 3600;
  const days = 1;
  return getStatsForPeriodAndInteval(base, quote, bucketSize, days);
};

const getDailyStats = (base, quote, usdPrices, buckets) => {
  if (!buckets.length) {
    return {
      baseVolume: 0,
      usdVolume: 0,
      price: 0,
      usdPrice: 0,
      change24h: 0,
      base: base.symbol,
      ticker: quote.symbol
    };
  }
  const volume = buckets.reduce((vol, itm) => parseInt(itm.base_volume, 10) + vol, 0);
  const baseVolume = precisedCount(volume, base.precision);
  const firstBucket = buckets[0];
  const lastBucket = buckets[buckets.length - 1];
  const firstBucketPrices = getPricesFromBucket(base.precision, quote.precision, firstBucket);
  const lastBucketPrices = getPricesFromBucket(base.precision, quote.precision, lastBucket);

  const priceDecrease = lastBucketPrices.close - firstBucketPrices.open;
  const change = (priceDecrease * 100) / lastBucketPrices.close;

  return {
    base: base.symbol,
    ticker: quote.symbol,
    baseVolume: +baseVolume.toFixed(base.precision),
    usdVolume: +(baseVolume / usdPrices.median).toFixed(2),
    price: lastBucketPrices.close,
    usdPrice: +(lastBucketPrices.close / usdPrices.last).toFixed(2),
    change24h: +change.toFixed(2)
  };
};

const getMarketStats = async (base, fiat, quotes) => {
  const baseAsset = assets[base];
  const usdAsset = assets[fiat];

  if (base !== fiat) {
    quotes.unshift(fiat);

    const [usdResult, ...others] = await Promise.all(
      quotes.map((quote) => dailyStatsInHourBuckets(baseAsset, assets[quote]))
    );

    const usdFirstBucket = usdResult.data[0];
    const usdLastBucket = usdResult.data[usdResult.data.length - 1];
    const usdPrices = getUsdPrices(baseAsset.precision, usdAsset.precision, usdFirstBucket, usdLastBucket);

    return others.reduce((result, rawStat) => {
      result[rawStat.asset.symbol] = getDailyStats(baseAsset, rawStat.asset, usdPrices, rawStat.data);
      return result;
    }, {});
  }

  // Otherwise get stats for Fiat market market
  const stats = await Promise.all(quotes.map((quote) => dailyStatsInHourBuckets(baseAsset, assets[quote])));
  return stats.reduce((result, rawStat) => {
    result[rawStat.asset.symbol] = getDailyStats(baseAsset, rawStat.asset, {
      median: 1,
      last: 1,
    }, rawStat.data);
    return result;
  }, {});
};

const getMarketChanges7d = async (base, quotes) => {
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


export default { getMarketStats, getMarketChanges7d };

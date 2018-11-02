import API from '../src/services/api';

const BTS_mock = {
  symbol: 'BTS',
  precision: 5,
  id: '1.3.0'
};

const ETH_mock = {
  symbol: 'OPEN.ETH',
  precision: 6,
  id: '1.3.850'
};

const USD_mock = {
  symbol: 'USD',
  precision: 4,
  id: '1.3.121'
};

const BTC_mock = {
  symbol: 'OPEN.BTC',
  precision: 8,
  id: '1.3.861'
};

test('base history for asset works', async () => {
  const result = await API.History.getMarketStats(BTS_mock, USD_mock, [ETH_mock, BTC_mock]);
  expect(result).toEqual(
    { 'OPEN.ETH':
      { baseVolume: 11373.32657,
        usdVolume: 1087.28,
        price: 2077.7266698581866,
        usdPrice: 197.86,
        change24h: '1.19' },
    'OPEN.BTC':
      { baseVolume: 2393342.4396,
        usdVolume: 228801.15,
        price: 66400.99192436131,
        usdPrice: 6323.38,
        change24h: '0.33' }
    });
});
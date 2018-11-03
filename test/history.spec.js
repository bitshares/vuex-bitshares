import API from '../src/services/api';

test('base history for asset works', async () => {
  const result = await API.History.getMarketStats('BTS', 'USD', ['OPEN.ETH', 'OPEN.BTC']);
  expect(result).toEqual(
    { 'OPEN.ETH':
      { baseVolume: 11373.32657,
        usdVolume: 1087.28,
        price: 2077.7266698581866,
        usdPrice: 197.86,
        ticker: 'OPEN.ETH',
        base: 'BTS',
        change24h: 1.19 },
    'OPEN.BTC':
      { baseVolume: 2393342.4396,
        usdVolume: 228801.15,
        price: 66400.99192436131,
        usdPrice: 6323.38,
        ticker: 'OPEN.BTC',
        base: 'BTS',
        change24h: 0.33 }
    });
});
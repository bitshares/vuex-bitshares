import Market from '../src/services/api/market.js';
import { createOrder, placeOrder } from '../src/services/api/transactions.js';

const DATE_TO_USE = new Date('2016');
const _Date = Date;
global.Date = jest.fn(() => DATE_TO_USE);
global.Date.UTC = _Date.UTC;
global.Date.parse = _Date.parse;
global.Date.now = _Date.now;



describe('test market orders', () => {
	const baseAsset = {
		symbol: 'BTS',
		id: '1.3.0',
		precision: 5
	}

	const quoteAsset = {
		symbol: 'USD',
		id: '1.3.113',
		precision: 2
	}
	const market = Market(baseAsset)

	const spendAssetSides = market.getOrderSides({
		type: 'spend',
		asset: quoteAsset,
		spend: 100,
		get: 1000
	});

	const getAssetSides = market.getOrderSides({
		type: 'get',
		asset: quoteAsset,
		spend: 1000,
		get: 100
	});

	test('sides are valid', () => {
		expect(spendAssetSides).toEqual({ 
			sell: { asset_id: '1.3.113', amount: 100 },
			receive: { asset_id: '1.3.0', amount: 1000 } 
		});
		expect(getAssetSides).toEqual({ 
			sell: { asset_id: '1.3.0', amount: 1000 },
			receive: { asset_id: '1.3.113', amount: 100 } 
		});
	});

	test('users appends and order creates', () => {
		const order = createOrder(spendAssetSides, 'testUser');
		const expiration = new Date();
  		expiration.setYear(expiration.getFullYear() + 5);
		expect(order).toEqual({ 
			seller: 'testUser',
      		amount_to_sell: { asset_id: '1.3.113', amount: 100 },
      		min_to_receive: { asset_id: '1.3.0', amount: 1000 },
      		expiration,
      		fill_or_kill: false 
      	});
	})
});
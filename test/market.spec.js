import Market from '../src/services/api/market.js';




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

	test('sides are valid', () => {
		expect(market.createOrder({
			type: 'spend',
			asset: quoteAsset,
			spend: 100,
			get: 1000
		})).toEqual({ 
			sell: { asset_id: '1.3.113', amount: 100 },
			receive: { asset_id: '1.3.0', amount: 1000 } 
		});

		expect(market.createOrder({
			type: 'get',
			asset: quoteAsset,
			spend: 1000,
			get: 100
		})).toEqual({ 
			sell: { asset_id: '1.3.0', amount: 1000 },
			receive: { asset_id: '1.3.113', amount: 100 } 
		});
	});

	
	console.log(market.createOrder({
		type: 'spend',
		asset: quoteAsset,
		spend: 100,
		get: 1000
	}))
});
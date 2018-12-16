import connection from './modules/connection';
import user from './modules/user';
import assets from './modules/assets';
import transactions from './modules/transactions';
import operations from './modules/operations';
import market from './modules/market';
import openledger from './modules/openledger';
import history from './modules/history';
import acc from './modules/acc';
import plugins from './plugins';

export default {
  modules: {
    connection,
    user,
    assets,
    transactions,
    operations,
    market,
    openledger,
    history,
    acc
  },
  plugins
};

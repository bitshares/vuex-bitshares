import Vue from 'vue';
import * as types from '../mutations';
import API from '../services/api';
import Subscriptions from '../services/api/subscriptions';


const actions = {
  /**
   * Dispatches actions to fetch user operations & subscribe to new operations of this user
   * @param {String} userId - user's id
   */
  fetchAndSubscribe: async (store, { userId, limit, callback }) => {
    // await actions.fetchUserOperations(store, { userId, limit });
    await actions.fetchUserOperations(store, { userId, limit });
    await actions.subscribeToUserOperations(store, { userId, callback });
  },

  /**
   * Fetches user operations
   * @param {String} userId - user's id
   */
  fetchUserOperations: async (store, { userId, limit }) => {
    const { commit } = store;
    commit(types.FETCH_USER_OPERATIONS_REQUEST);
    const result = await API.Operations.getUserOperations({ userId, limit });
    if (result.success) {
      // fetch assets used in operations
      store.dispatch('assets/fetchAssets', { assets: result.data.assetsIds }, { root: true });
      commit(types.FETCH_USER_OPERATIONS_COMPLETE, {
        operations: result.data.operations
      });
    } else {
      commit(types.FETCH_USER_OPERATIONS_ERROR, {
        error: result.error
      });
    }
    return result;
  },

  /**
   * Add new operation to operation's list. This action is dispatched on a callback
    to new user's operation received
   * @param {String} userId - user's id
   * @param {Object} operation - operation date object
   */
  addUserOperation: async (store, { operation, userId, callback }) => {
    const { commit } = store;
    // parse operation data for better format & information
    const parsedData = await API.Operations.parseOperations({
      operations: [operation],
      userId
    });
    if (!parsedData) return;

    const { type } = parsedData.operations[0];
    console.log(type)
    if (type === 'transfer' || type === 'fill_order' || type === 'cancel_order'
      || type === 'limit_order_create') {
      // update current user balances
      store.dispatch('acc/fetchCurrentUser', null, { root: true });
      if (callback) callback(type)
    }
    store.dispatch('assets/fetchAssets', { assets: parsedData.assetsIds }, { root: true });
    commit(types.ADD_USER_OPERATION, {
      operation: parsedData.operations[0]
    });
  },

  /**
   * Subscribes to new user's operations
   * @param {String} userId - user's id
   */
  subscribeToUserOperations(store, { userId, callback }) {
    const { commit } = store;
    const userOperations = new Subscriptions.UserOperations({
      userId,
      callback: (operation) => {
        console.log('new operation: ', operation);
        actions.addUserOperation(store, { operation, userId, callback });
      }
    });
    API.ChainListener.addSubscription(userOperations);
    commit(types.SUBSCRIBE_TO_USER_OPERATIONS);
  },

  /**
   * Unsubscribes from new user's operations
   */
  unsubscribeFromUserOperations(store) {
    const { commit } = store;
    API.ChainListener.deleteSubscription('userOperation');
    commit(types.UNSUBSCRIBE_FROM_USER_OPERATIONS);
  },

  resetState(store) {
    const { commit } = store;
    commit(types.RESET_OPERATIONS);
  }
};

const getters = {
  getOperations: state => state.list,
  getActiveOrders: state => {
    const openedOrder = state.list.filter(x => x.type === 'limit_order_create');
    const canceledOrders = state.list.filter(x => x.type === 'limit_order_cancel');
    const filledOrders = state.list.filter(x => x.type === 'fill_order');
    const notCanceledOrders = openedOrder.filter(x => !canceledOrders.some(y => y.orderId === x.orderId));
    notCanceledOrders.forEach(notCancelOrder => {
      let percentFilled = 0;
      filledOrders.forEach(filledOrder => {
        if (filledOrder.orderId === notCancelOrder.orderId) {
          const remain = notCancelOrder.payload.amount_to_sell.amount - filledOrder.payload.pays.amount;
          percentFilled = +(
            ((notCancelOrder.payload.amount_to_sell.amount - remain)
              / notCancelOrder.payload.amount_to_sell.amount)
              * 100);
        }
      });
      if (percentFilled < 100) {
        notCancelOrder.percentFilled = percentFilled;
      }
    });


    const activeOrders = notCanceledOrders.filter(
      x => Object.prototype.hasOwnProperty.call(x, 'percentFilled')
    );
    return activeOrders;
  },
  isFetching: state => state.pending,
  isError: state => state.error,
  isSubscribed: state => state.subscribed
};

const initialState = {
  list: [],
  pending: false,
  error: false,
  subscribed: false
};

const mutations = {
  [types.FETCH_USER_OPERATIONS_REQUEST]: (state) => {
    state.pending = true;
    state.error = null;
  },
  [types.FETCH_USER_OPERATIONS_COMPLETE]: (state, { operations }) => {
    state.pending = false;
    Vue.set(state, 'list', operations);
  },
  [types.FETCH_USER_OPERATIONS_ERROR]: (state, { error }) => {
    state.pending = false;
    state.error = error;
  },
  [types.ADD_USER_OPERATION]: (state, { operation }) => {
    const newList = state.list.slice();
    newList.unshift(operation);
    Vue.set(state, 'list', newList);
  },
  [types.SUBSCRIBE_TO_USER_OPERATIONS]: (state) => {
    state.subscribed = true;
  },
  [types.UNSUBSCRIBE_FROM_USER_OPERATIONS]: (state) => {
    state.subscribed = false;
  },
  [types.RESET_OPERATIONS]: (state) => {
    state.list = [];
    state.pending = false;
    state.error = false;
  }
};

export default {
  state: initialState,
  mutations,
  actions,
  getters,
  namespaced: true
};

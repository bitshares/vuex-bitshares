import Vue from 'vue';

export const types = {
  TRANSFER_ASSET_REQUEST: 'TRANSFER_ASSET_REQUEST',
  TRANSFER_ASSET_ERROR: 'TRANSFER_ASSET_ERROR',
  TRANSFER_ASSET_COMPLETE: 'TRANSFER_ASSET_COMPLETE',
  UPDATE_PENDING_ORDERS: 'UPDATE_PENDING_ORDERS',
  SET_PENDING_DISTRIBUTION: 'SET_PENDING_DISTRIBUTION',
  REMOVE_PENDING_DISTRIBUTION: 'REMOVE_PENDING_DISTRIBUTION',
  RESET_PENDING_ORDERS: 'RESET_PENDING_ORDERS',
  PROCESS_PENDING_ORDERS_REQUEST: 'PROCESS_PENDING_ORDERS_REQUEST',
  PROCESS_PENDING_ORDERS_COMPLETE: 'PROCESS_PENDING_ORDERS_COMPLETE',
  PROCESS_PENDING_ORDERS_ERROR: 'PROCESS_PENDING_ORDERS_ERROR',
  PROCESS_PENDING_ORDERS_SELL_COMPLETE: 'PROCESS_PENDING_ORDERS_SELL_COMPLETE',
  FETCH_FEES: 'FETCH_FEES',
  SET_PENDING_TRANSFER: 'SET_PENDING_TRANSFER',
  PROCESS_CANCEL_ORDER_REQUEST: 'PROCESS_CANCE_ORDER_REQUEST',
  PROCESS_CANCEL_ORDER_COMPLETE: 'PROCESS_CANCEL_ORDER_COMPLETE',
  PROCESS_CANCEL_ORDER_ERROR: 'PROCESS_CANCEL_ORDER_ERROR'
};

export const mutations = {
  [types.TRANSFER_ASSET_REQUEST](state) {
    state.transactionsProcessing = true;
  },
  [types.TRANSFER_ASSET_ERROR](state, error) {
    state.error = error;
    state.transactionsProcessing = false;
  },
  [types.TRANSFER_ASSET_COMPLETE](state) {
    state.transactionsProcessing = false;
  },
  [types.UPDATE_PENDING_ORDERS](state, { orders }) {
    if (state.sellOrdersProcessed) orders.sellOrders = [];
    Vue.set(state, 'pendingOrders', orders);
  },
  [types.SET_PENDING_DISTRIBUTION](state, { distribution }) {
    state.pendingDistributionUpdate = distribution;
  },
  [types.REMOVE_PENDING_DISTRIBUTION](state) {
    state.pendingDistributionUpdate = null;
    state.pendingOrders.sellOrders = [];
    state.pendingOrders.buyOrders = [];
    state.sellOrdersProcessed = false;
  },
  [types.PROCESS_PENDING_ORDERS_REQUEST](state) {
    state.transactionsProcessing = true;
  },
  [types.PROCESS_PENDING_ORDERS_ERROR](state) {
    state.transactionsProcessing = false;
  },
  [types.PROCESS_PENDING_ORDERS_COMPLETE](state) {
    state.transactionsProcessing = false;
  },
  [types.SET_PENDING_TRANSFER](state, { transaction }) {
    state.pendingTransfer = transaction;
  },
  [types.CLEAR_PENDING_TRANSFER](state) {
    state.pendingTransfer = false;
  },
  [types.FETCH_FEES](state, { fees }) {
    state.fees = fees;
  },
  [types.PROCESS_PENDING_ORDERS_SELL_COMPLETE](state) {
    state.pendingOrders.sellOrders = [];
    state.sellOrdersProcessed = true;
  },
  [types.PROCESS_CANCEL_ORDER_REQUEST](state, orderId) {
    state.pendingCancelOrder = orderId;
  },
  [types.PROCESS_CANCEL_ORDER_COMPLETE](state) {
    state.pendingCancelOrder = false;
  },
  [types.PROCESS_CANCEL_ORDER_ERROR](state) {
    state.pendingCancelOrder = false;    
  }
};

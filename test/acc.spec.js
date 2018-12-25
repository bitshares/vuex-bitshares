/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import acc from '../src/modules/acc';
import { getDefaultState } from '../src/modules/acc/defaultState';

jest.mock('../src/services/api/account.js');
jest.mock('../src/services/api/backup.js');

const localVue = createLocalVue();
localVue.use(Vuex);

const initialState = getDefaultState();

describe('Assets module: getters', () => {
  let store;
  let state;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        acc
      }
    });
    state = store.state.acc;
  });

  test('has correct initial state', () => {
    expect(state).toEqual(getDefaultState());
  });

  test('has correct getters', () => {
    state.userId = '123';
    expect(store.getters['acc/getAccountUserId']).toBe('123');
    expect(store.getters['acc/getCurrentUserName']).toBe(null);
    state.userData = { account: { name: 'h0bb1t' } };
    expect(store.getters['acc/getCurrentUserName']).toBe('h0bb1t');

    expect(store.getters['acc/getUserBalances']).toEqual({});
    state.userData = {
      balances: {
        '1.2.3': { balance: 100 },
        '1.2.5': { balance: 0 },
        '1.2.6': { balance: 2900 }
      }
    };
    expect(store.getters['acc/getUserBalances']).toEqual({
      '1.2.3': { balance: 100 },
      '1.2.6': { balance: 2900 }
    });

    expect(store.getters['acc/isLoggedIn']).toBe(true);
    state.userId = null;
    expect(store.getters['acc/isLoggedIn']).toBe(false);

    expect(store.getters['acc/getKeys']).toBe(null);
    state.keys = {
      active: '123',
      owner: null
    };
    expect(store.getters['acc/getKeys']).toBe(null);
    state.keys.owner = '555';
    expect(store.getters['acc/getKeys']).toEqual({
      active: '123',
      owner: '555'
    });
    // TODO: more tests for getKeys getter with decryption OR remove this getter
  });
});

describe('Assets module: mutations', () => {
  let state;

  beforeEach(() => {
    state = getDefaultState();
  });

  test('ACCOUNT_CLOUD_LOGIN', () => {
    acc.mutations.ACCOUNT_CLOUD_LOGIN(state, { userId: 'aaa', keys: { active: 1, owner: 2 } });
    expect(state.userId).toBe('aaa');
    expect(state.keys).toEqual({ active: 1, owner: 2 });
    expect(state.userType).toBe('password');
  });

  test('ACCOUNT_BRAINKEY_LOGIN', () => {
    acc.mutations.ACCOUNT_BRAINKEY_LOGIN(state, {
      userId: 'aaa',
      wallet: {
        passwordPubkey: 1,
        encryptedBrainkey: 2,
        encryptionKey: 3,
        aesPrivate: 4
      }
    });
    expect(state.userId).toBe('aaa');
    expect(state.wallet).toEqual({
      passwordPubkey: 1,
      encryptedBrainkey: 2,
      encryptionKey: 3,
      aesPrivate: 4
    });
    expect(state.userType).toBe('wallet');
  });

  test('ACCOUNT_SIGNUP', () => {
    acc.mutations.ACCOUNT_SIGNUP(state, {
      userId: 'aaa',
      wallet: {
        passwordPubkey: 1,
        encryptedBrainkey: 2,
        encryptionKey: 3,
        aesPrivate: 4
      }
    });
    expect(state.userId).toBe('aaa');
    expect(state.wallet).toEqual({
      passwordPubkey: 1,
      encryptedBrainkey: 2,
      encryptionKey: 3,
      aesPrivate: 4
    });
    expect(state.userType).toBe('wallet');
  });

  test('ACCOUNT_LOGOUT', () => {
    acc.mutations.ACCOUNT_LOGOUT(state);
    expect(state).toEqual(getDefaultState());
  });

  test('FETCH_CURRENT_USER', () => {
    acc.mutations.FETCH_CURRENT_USER(state, { data: { balances: [1, 2, 3], account: 'zzz' } });
    expect(state.userData).toEqual({ balances: [1, 2, 3], account: 'zzz' });
  });
});

describe('Assets module: actions', () => {
  let store;
  let state;

  beforeEach(() => {
    // todo: debug deep clone module
    store = new Vuex.Store({
      modules: {
        acc
      }
    });
    state = store.state.acc;
  });

  const testCloudAccount = {
    name: 'chipiga-test',
    password: 'P5KJ7gvTapkPDoKQ4iuJxxPZ966nX9jdPhRvVH4xZwuTq'
  };

  test('Cloud login', async () => {
    const response = await store.dispatch('acc/cloudLogin', testCloudAccount);
    expect(response.error).toEqual(false);
    expect(state.userId).toEqual('1.2.1209196');
  });

  const testBrainkey = 'brinjal gardy brulee lotic athymia onstead reopen dance '
    + 'reking arisard stylish retaker assuage anywise dyaster skiddoo';

  test('Brainkey login', async () => {
    const response = await store.dispatch('acc/brainkeyLogin', {
      brainkey: testBrainkey,
      password: '11111111'
    });
    expect(response.error).toEqual(false);
    expect(state.userId).toEqual('1.2.1209224');
  });

  test('Signs up with password', async () => {
    const response = await store.dispatch('acc/signupWithPassword', { name: 'hobb1t', password: 'hzhzhz' });
    expect(response.error).toEqual(false);
    expect(state.userType).toEqual('password');
    expect(state.userId).toEqual('1.2.512210');
  });


  test('Fetches current user data', async () => {
    await store.dispatch('acc/fetchCurrentUser');
    expect(Object.keys(state.userData.balances)).toEqual(['1.3.0', '1.3.850']);
  });

  test('Signs up with brainkey', async () => {
    const response = await store.dispatch(
      'acc/signupBrainkey',
      {
        name: 'hobb1t',
        password: 'hzhzhz',
        dictionary: 'zazaza'
      }
    );
    expect(response.error).toEqual(false);
    expect(state.userType).toEqual('wallet');
    expect(state.userId).toEqual('1.2.512210');
  });


  test('File login', async () => {
    const response = await store.dispatch(
      'acc/fileLogin',
      {
        backup: 'hobb1t_backup_wif',
        password: 'hzhzhz'
      }
    );
    expect(response.success).toEqual(true);
    expect(state.userType).toEqual('wallet');
    expect(state.userId).toEqual('1.2.512210');
  });

  test('Logout', () => {
    store.dispatch('acc/logout');
    expect(state).toEqual(getDefaultState());
  });
});

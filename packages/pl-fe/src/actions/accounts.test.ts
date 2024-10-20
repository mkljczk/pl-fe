import { Map as ImmutableMap } from 'immutable';

import { __stub } from 'pl-fe/api';
import { buildInstance, buildRelationship } from 'pl-fe/jest/factory';
import { mockStore, rootState } from 'pl-fe/jest/test-helpers';
import { normalizeAccount } from 'pl-fe/normalizers/account';
import { ListRecord, ReducerRecord } from 'pl-fe/reducers/user-lists';

import {
  authorizeFollowRequest,
  blockAccount,
  createAccount,
  expandFollowRequests,
  fetchAccount,
  fetchAccountByUsername,
  fetchFollowRequests,
  fetchRelationships,
  muteAccount,
  removeFromFollowers,
  subscribeAccount,
  unblockAccount,
  unmuteAccount,
  unsubscribeAccount,
} from './accounts';

let store: ReturnType<typeof mockStore>;

describe('createAccount()', () => {
  const params = {
    email: 'foo@bar.com',
  };

  describe('with a successful API request', () => {
    beforeEach(() => {
      const state = rootState;
      store = mockStore(state);

      __stub((mock) => {
        mock.onPost('/api/v1/accounts').reply(200, { token: '123 ' });
      });
    });

    it('dispatches the correct actions', async() => {
      const expectedActions = [
        { type: 'ACCOUNT_CREATE_REQUEST', params },
        {
          type: 'ACCOUNT_CREATE_SUCCESS',
          params,
          token: { token: '123 ' },
        },
      ];
      await store.dispatch(createAccount(params));
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });
});

describe('fetchAccount()', () => {
  const id = '123';

  describe('when the account has "should_refetch" set to false', () => {
    beforeEach(() => {
      const account = normalizeAccount({
        id,
        acct: 'justin-username',
        display_name: 'Justin L',
        avatar: 'test.jpg',
      });

      const state = {
        ...rootState,
        entities: {
          'ACCOUNTS': {
            store: {
              [id]: account,
            },
            lists: {},
          },
        },
      };

      store = mockStore(state);

      __stub((mock) => {
        mock.onGet(`/api/v1/accounts/${id}`).reply(200, account);
      });
    });

    it('should do nothing', async() => {
      await store.dispatch(fetchAccount(id));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('with a successful API request', async () => {
    const account = await import('pl-fe/__fixtures__/pleroma-account.json');

    beforeEach(() => {
      const state = rootState;
      store = mockStore(state);

      __stub((mock) => {
        mock.onGet(`/api/v1/accounts/${id}`).reply(200, account);
      });
    });

    it('should dispatch the correct actions', async() => {
      const expectedActions = [
        { type: 'ACCOUNT_FETCH_REQUEST', id: '123' },
        { type: 'ACCOUNTS_IMPORT', accounts: [account] },
        {
          type: 'ACCOUNT_FETCH_SUCCESS',
          account,
        },
      ];

      await store.dispatch(fetchAccount(id));
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });

  describe('with an unsuccessful API request', () => {
    beforeEach(() => {
      const state = rootState;
      store = mockStore(state);

      __stub((mock) => {
        mock.onGet(`/api/v1/accounts/${id}`).networkError();
      });
    });

    it('should dispatch the correct actions', async() => {
      const expectedActions = [
        { type: 'ACCOUNT_FETCH_REQUEST', id: '123' },
        {
          type: 'ACCOUNT_FETCH_FAIL',
          id,
          error: new Error('Network Error'),
          skipAlert: true,
        },
      ];

      await store.dispatch(fetchAccount(id));
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });
});

describe('fetchAccountByUsername()', () => {
  const id = '123';
  const username = 'tiger';
  let state, account: any;

  beforeEach(() => {
    account = normalizeAccount({
      id,
      acct: username,
      display_name: 'Tiger',
      avatar: 'test.jpg',
      birthday: undefined,
    });

    state = {
      ...rootState,
      entities: {
        'ACCOUNTS': {
          store: {
            [id]: account,
          },
          lists: {},
        },
      },
    };

    store = mockStore(state);

    __stub((mock) => {
      mock.onGet(`/api/v1/accounts/${id}`).reply(200, account);
    });
  });

  describe('when "accountByUsername" feature is enabled', () => {
    beforeEach(() => {
      const state = {
        ...rootState,
        me: '123',
        instance: buildInstance({
          version: '2.7.2 (compatible; Pleroma 2.4.52-1337-g4779199e.gleasonator+soapbox)',
          pleroma: {
            metadata: {
              features: [],
            },
          },
        }),
      };

      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${username}`).reply(200, account);
          mock.onGet(`/api/v1/accounts/relationships?${[account.id].map(id => `id[]=${id}`).join('&')}`);
        });
      });

      it('should return dispatch the proper actions', async() => {
        await store.dispatch(fetchAccountByUsername(username));
        const actions = store.getActions();

        expect(actions[0]).toEqual({
          type: 'RELATIONSHIPS_FETCH_REQUEST',
          ids: ['123'],
        });
        expect(actions[1].type).toEqual('ACCOUNTS_IMPORT');
        expect(actions[2].type).toEqual('ACCOUNT_FETCH_SUCCESS');
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${username}`).networkError();
        });
      });

      it('should return dispatch the proper actions', async() => {
        const expectedActions = [
          {
            type: 'ACCOUNT_FETCH_FAIL',
            id: null,
            error: new Error('Network Error'),
            skipAlert: true,
          },
          { type: 'ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP', username: 'tiger' },
        ];

        await store.dispatch(fetchAccountByUsername(username));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });

  describe('when "accountLookup" feature is enabled', () => {
    beforeEach(() => {
      const state = {
        ...rootState,
        me: '123',
        instance: buildInstance({
          version: '3.4.1 (compatible; TruthSocial 1.0.0)',
          pleroma: {
            metadata: {
              features: [],
            },
          },
        }),
      };

      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/accounts/lookup').reply(200, account);
        });
      });

      it('should return dispatch the proper actions', async() => {
        await store.dispatch(fetchAccountByUsername(username));
        const actions = store.getActions();

        expect(actions[0]).toEqual({
          type: 'ACCOUNT_LOOKUP_REQUEST',
          acct: username,
        });
        expect(actions[1].type).toEqual('ACCOUNTS_IMPORT');
        expect(actions[2].type).toEqual('ACCOUNT_LOOKUP_SUCCESS');
        expect(actions[3].type).toEqual('RELATIONSHIPS_FETCH_REQUEST');
        expect(actions[4].type).toEqual('ACCOUNT_FETCH_SUCCESS');
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/accounts/lookup').networkError();
        });
      });

      it('should return dispatch the proper actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_LOOKUP_REQUEST', acct: 'tiger' },
          { type: 'ACCOUNT_LOOKUP_FAIL' },
          {
            type: 'ACCOUNT_FETCH_FAIL',
            id: null,
            error: new Error('Network Error'),
            skipAlert: true,
          },
          { type: 'ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP', username },
        ];

        await store.dispatch(fetchAccountByUsername(username));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });

  describe('when using the accountSearch function', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/accounts/search').reply(200, [account]);
        });
      });

      it('should return dispatch the proper actions', async() => {
        await store.dispatch(fetchAccountByUsername(username));
        const actions = store.getActions();

        expect(actions[0]).toEqual({
          type: 'ACCOUNT_SEARCH_REQUEST',
          params: { q: username, limit: 5, resolve: true },
        });
        expect(actions[1].type).toEqual('ACCOUNTS_IMPORT');
        expect(actions[2].type).toEqual('ACCOUNT_SEARCH_SUCCESS');
        expect(actions[3]).toEqual({
          type: 'RELATIONSHIPS_FETCH_REQUEST',
          ids: [ '123' ],
        });
        expect(actions[4].type).toEqual('ACCOUNT_FETCH_SUCCESS');
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/accounts/search').networkError();
        });
      });

      it('should return dispatch the proper actions', async() => {
        const expectedActions = [
          {
            type: 'ACCOUNT_SEARCH_REQUEST',
            params: { q: username, limit: 5, resolve: true },
          },
          { type: 'ACCOUNT_SEARCH_FAIL', skipAlert: true },
          {
            type: 'ACCOUNT_FETCH_FAIL',
            id: null,
            error: new Error('Network Error'),
            skipAlert: true,
          },
          { type: 'ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP', username },
        ];

        await store.dispatch(fetchAccountByUsername(username));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('blockAccount()', () => {
  const id = '1';

  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(blockAccount(id));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/block`).reply(200, {});
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_BLOCK_REQUEST', id },
          {
            type: 'ACCOUNT_BLOCK_SUCCESS',
            relationship: {},
            statuses: ImmutableMap({}),
          },
        ];
        await store.dispatch(blockAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/block`).networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_BLOCK_REQUEST', id },
          { type: 'ACCOUNT_BLOCK_FAIL', error: new Error('Network Error') },
        ];
        await store.dispatch(blockAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('unblockAccount()', () => {
  const id = '1';

  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(unblockAccount(id));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/unblock`).reply(200, {});
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_UNBLOCK_REQUEST', id },
          {
            type: 'ACCOUNT_UNBLOCK_SUCCESS',
            relationship: {},
          },
        ];
        await store.dispatch(unblockAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/unblock`).networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_UNBLOCK_REQUEST', id },
          { type: 'ACCOUNT_UNBLOCK_FAIL', error: new Error('Network Error') },
        ];
        await store.dispatch(unblockAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('muteAccount()', () => {
  const id = '1';

  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(unblockAccount(id));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/mute`).reply(200, {});
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_MUTE_REQUEST', id },
          {
            type: 'ACCOUNT_MUTE_SUCCESS',
            relationship: {},
            statuses: ImmutableMap({}),
          },
        ];
        await store.dispatch(muteAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/mute`).networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_MUTE_REQUEST', id },
          { type: 'ACCOUNT_MUTE_FAIL', error: new Error('Network Error') },
        ];
        await store.dispatch(muteAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('unmuteAccount()', () => {
  const id = '1';

  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(unblockAccount(id));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/unmute`).reply(200, {});
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_UNMUTE_REQUEST', id },
          {
            type: 'ACCOUNT_UNMUTE_SUCCESS',
            relationship: {},
          },
        ];
        await store.dispatch(unmuteAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/unmute`).networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_UNMUTE_REQUEST', id },
          { type: 'ACCOUNT_UNMUTE_FAIL', error: new Error('Network Error') },
        ];
        await store.dispatch(unmuteAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('subscribeAccount()', () => {
  const id = '1';

  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(subscribeAccount(id));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/pleroma/accounts/${id}/subscribe`).reply(200, {});
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_SUBSCRIBE_REQUEST', id },
          {
            type: 'ACCOUNT_SUBSCRIBE_SUCCESS',
            relationship: {},
          },
        ];
        await store.dispatch(subscribeAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/pleroma/accounts/${id}/subscribe`).networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_SUBSCRIBE_REQUEST', id },
          { type: 'ACCOUNT_SUBSCRIBE_FAIL', error: new Error('Network Error') },
        ];
        await store.dispatch(subscribeAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('unsubscribeAccount()', () => {
  const id = '1';

  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(subscribeAccount(id));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/pleroma/accounts/${id}/unsubscribe`).reply(200, {});
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_UNSUBSCRIBE_REQUEST', id },
          {
            type: 'ACCOUNT_UNSUBSCRIBE_SUCCESS',
            relationship: {},
          },
        ];
        await store.dispatch(unsubscribeAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/pleroma/accounts/${id}/unsubscribe`).networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_UNSUBSCRIBE_REQUEST', id },
          { type: 'ACCOUNT_UNSUBSCRIBE_FAIL', error: new Error('Network Error') },
        ];
        await store.dispatch(unsubscribeAccount(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('removeFromFollowers()', () => {
  const id = '1';

  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(removeFromFollowers(id));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/remove_from_followers`).reply(200, {});
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_REMOVE_FROM_FOLLOWERS_REQUEST', id },
          {
            type: 'ACCOUNT_REMOVE_FROM_FOLLOWERS_SUCCESS',
            relationship: {},
          },
        ];
        await store.dispatch(removeFromFollowers(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/accounts/${id}/remove_from_followers`).networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'ACCOUNT_REMOVE_FROM_FOLLOWERS_REQUEST', id },
          { type: 'ACCOUNT_REMOVE_FROM_FOLLOWERS_FAIL', id, error: new Error('Network Error') },
        ];
        await store.dispatch(removeFromFollowers(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('fetchRelationships()', () => {
  const id = '1';

  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(fetchRelationships([id]));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('without newAccountIds', () => {
      beforeEach(() => {
        const state = {
          ...rootState,
          me: '123',
          relationships: ImmutableMap({ [id]: buildRelationship() }),
        };

        store = mockStore(state);
      });

      it('should do nothing', async() => {
        await store.dispatch(fetchRelationships([id]));
        const actions = store.getActions();

        expect(actions).toEqual([]);
      });
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        const state = {
          ...rootState,
          me: '123',
          relationships: ImmutableMap(),
        };

        store = mockStore(state);

        __stub((mock) => {
          mock
            .onGet(`/api/v1/accounts/relationships?${[id].map(id => `id[]=${id}`).join('&')}`)
            .reply(200, []);
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'RELATIONSHIPS_FETCH_REQUEST', ids: [id] },
          { type: 'RELATIONSHIPS_FETCH_SUCCESS', relationships: [] },
        ];
        await store.dispatch(fetchRelationships([id]));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock
            .onGet(`/api/v1/accounts/relationships?${[id].map(id => `id[]=${id}`).join('&')}`)
            .networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'RELATIONSHIPS_FETCH_REQUEST', ids: [id] },
          { type: 'RELATIONSHIPS_FETCH_FAIL', error: new Error('Network Error') },
        ];
        await store.dispatch(fetchRelationships([id]));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('fetchFollowRequests()', () => {
  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(fetchFollowRequests());
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        const state = {
          ...rootState,
          me: '123',
          relationships: ImmutableMap(),
        };

        store = mockStore(state);

        __stub((mock) => {
          mock.onGet('/api/v1/follow_requests').reply(200, [], {
            link: '<https://example.com/api/v1/follow_requests?since_id=1>; rel=\'prev\'',
          });
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'FOLLOW_REQUESTS_FETCH_REQUEST' },
          { type: 'ACCOUNTS_IMPORT', accounts: [] },
          {
            type: 'FOLLOW_REQUESTS_FETCH_SUCCESS',
            accounts: [],
            next: null,
          },
        ];
        await store.dispatch(fetchFollowRequests());
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/follow_requests').networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'FOLLOW_REQUESTS_FETCH_REQUEST' },
          { type: 'FOLLOW_REQUESTS_FETCH_FAIL', error: new Error('Network Error') },
        ];
        await store.dispatch(fetchFollowRequests());
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('expandFollowRequests()', () => {
  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(expandFollowRequests());
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = {
        ...rootState,
        me: '123',
        user_lists: ReducerRecord({
          follow_requests: ListRecord({
            next: 'next_url',
          }),
        }),
      };
      store = mockStore(state);
    });

    describe('when the url is null', () => {
      beforeEach(() => {
        const state = {
          ...rootState,
          me: '123',
          user_lists: ReducerRecord({
            follow_requests: ListRecord({
              next: null,
            }),
          }),
        };
        store = mockStore(state);
      });

      it('should do nothing', async() => {
        await store.dispatch(expandFollowRequests());
        const actions = store.getActions();

        expect(actions).toEqual([]);
      });
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('next_url').reply(200, [], {
            link: '<next_url>; rel=\'prev\'',
          });
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'FOLLOW_REQUESTS_EXPAND_REQUEST' },
          { type: 'ACCOUNTS_IMPORT', accounts: [] },
          {
            type: 'FOLLOW_REQUESTS_EXPAND_SUCCESS',
            accounts: [],
            next: null,
          },
        ];
        await store.dispatch(expandFollowRequests());
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('next_url').networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'FOLLOW_REQUESTS_EXPAND_REQUEST' },
          { type: 'FOLLOW_REQUESTS_EXPAND_FAIL', error: new Error('Network Error') },
        ];
        await store.dispatch(expandFollowRequests());
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

describe('authorizeFollowRequest()', () => {
  const id = '1';

  describe('when logged out', () => {
    beforeEach(() => {
      const state = { ...rootState, me: null };
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(authorizeFollowRequest(id));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const state = { ...rootState, me: '123' };
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/follow_requests/${id}/authorize`).reply(200);
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'FOLLOW_REQUEST_AUTHORIZE_REQUEST', id },
          { type: 'FOLLOW_REQUEST_AUTHORIZE_SUCCESS', id },
        ];
        await store.dispatch(authorizeFollowRequest(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onPost(`/api/v1/follow_requests/${id}/authorize`).networkError();
        });
      });

      it('should dispatch the correct actions', async() => {
        const expectedActions = [
          { type: 'FOLLOW_REQUEST_AUTHORIZE_REQUEST', id },
          { type: 'FOLLOW_REQUEST_AUTHORIZE_FAIL', id, error: new Error('Network Error') },
        ];
        await store.dispatch(authorizeFollowRequest(id));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});

import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { selectAccount } from 'soapbox/selectors';
import { isLoggedIn } from 'soapbox/utils/auth';
import { getFeatures, parseVersion, PLEROMA } from 'soapbox/utils/features';

import api, { getLinks, type PlfeResponse } from '../api';

import {
  importFetchedAccount,
  importFetchedAccounts,
  importErrorWhileFetchingAccountByUsername,
} from './importer';

import type { Map as ImmutableMap } from 'immutable';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Status } from 'soapbox/types/entities';
import type { History } from 'soapbox/types/history';

const ACCOUNT_CREATE_REQUEST = 'ACCOUNT_CREATE_REQUEST';
const ACCOUNT_CREATE_SUCCESS = 'ACCOUNT_CREATE_SUCCESS';
const ACCOUNT_CREATE_FAIL    = 'ACCOUNT_CREATE_FAIL';

const ACCOUNT_FETCH_REQUEST = 'ACCOUNT_FETCH_REQUEST';
const ACCOUNT_FETCH_SUCCESS = 'ACCOUNT_FETCH_SUCCESS';
const ACCOUNT_FETCH_FAIL    = 'ACCOUNT_FETCH_FAIL';

const ACCOUNT_BLOCK_REQUEST = 'ACCOUNT_BLOCK_REQUEST';
const ACCOUNT_BLOCK_SUCCESS = 'ACCOUNT_BLOCK_SUCCESS';
const ACCOUNT_BLOCK_FAIL    = 'ACCOUNT_BLOCK_FAIL';

const ACCOUNT_UNBLOCK_REQUEST = 'ACCOUNT_UNBLOCK_REQUEST';
const ACCOUNT_UNBLOCK_SUCCESS = 'ACCOUNT_UNBLOCK_SUCCESS';
const ACCOUNT_UNBLOCK_FAIL    = 'ACCOUNT_UNBLOCK_FAIL';

const ACCOUNT_MUTE_REQUEST = 'ACCOUNT_MUTE_REQUEST';
const ACCOUNT_MUTE_SUCCESS = 'ACCOUNT_MUTE_SUCCESS';
const ACCOUNT_MUTE_FAIL    = 'ACCOUNT_MUTE_FAIL';

const ACCOUNT_UNMUTE_REQUEST = 'ACCOUNT_UNMUTE_REQUEST';
const ACCOUNT_UNMUTE_SUCCESS = 'ACCOUNT_UNMUTE_SUCCESS';
const ACCOUNT_UNMUTE_FAIL    = 'ACCOUNT_UNMUTE_FAIL';

const ACCOUNT_SUBSCRIBE_REQUEST = 'ACCOUNT_SUBSCRIBE_REQUEST';
const ACCOUNT_SUBSCRIBE_SUCCESS = 'ACCOUNT_SUBSCRIBE_SUCCESS';
const ACCOUNT_SUBSCRIBE_FAIL    = 'ACCOUNT_SUBSCRIBE_FAIL';

const ACCOUNT_UNSUBSCRIBE_REQUEST = 'ACCOUNT_UNSUBSCRIBE_REQUEST';
const ACCOUNT_UNSUBSCRIBE_SUCCESS = 'ACCOUNT_UNSUBSCRIBE_SUCCESS';
const ACCOUNT_UNSUBSCRIBE_FAIL    = 'ACCOUNT_UNSUBSCRIBE_FAIL';

const ACCOUNT_PIN_REQUEST = 'ACCOUNT_PIN_REQUEST';
const ACCOUNT_PIN_SUCCESS = 'ACCOUNT_PIN_SUCCESS';
const ACCOUNT_PIN_FAIL    = 'ACCOUNT_PIN_FAIL';

const ACCOUNT_UNPIN_REQUEST = 'ACCOUNT_UNPIN_REQUEST';
const ACCOUNT_UNPIN_SUCCESS = 'ACCOUNT_UNPIN_SUCCESS';
const ACCOUNT_UNPIN_FAIL    = 'ACCOUNT_UNPIN_FAIL';

const ACCOUNT_REMOVE_FROM_FOLLOWERS_REQUEST = 'ACCOUNT_REMOVE_FROM_FOLLOWERS_REQUEST';
const ACCOUNT_REMOVE_FROM_FOLLOWERS_SUCCESS = 'ACCOUNT_REMOVE_FROM_FOLLOWERS_SUCCESS';
const ACCOUNT_REMOVE_FROM_FOLLOWERS_FAIL    = 'ACCOUNT_REMOVE_FROM_FOLLOWERS_FAIL';

const PINNED_ACCOUNTS_FETCH_REQUEST = 'PINNED_ACCOUNTS_FETCH_REQUEST';
const PINNED_ACCOUNTS_FETCH_SUCCESS = 'PINNED_ACCOUNTS_FETCH_SUCCESS';
const PINNED_ACCOUNTS_FETCH_FAIL = 'PINNED_ACCOUNTS_FETCH_FAIL';

const ACCOUNT_SEARCH_REQUEST = 'ACCOUNT_SEARCH_REQUEST';
const ACCOUNT_SEARCH_SUCCESS = 'ACCOUNT_SEARCH_SUCCESS';
const ACCOUNT_SEARCH_FAIL    = 'ACCOUNT_SEARCH_FAIL';

const ACCOUNT_LOOKUP_REQUEST = 'ACCOUNT_LOOKUP_REQUEST';
const ACCOUNT_LOOKUP_SUCCESS = 'ACCOUNT_LOOKUP_SUCCESS';
const ACCOUNT_LOOKUP_FAIL    = 'ACCOUNT_LOOKUP_FAIL';

const FOLLOWERS_FETCH_REQUEST = 'FOLLOWERS_FETCH_REQUEST';
const FOLLOWERS_FETCH_SUCCESS = 'FOLLOWERS_FETCH_SUCCESS';
const FOLLOWERS_FETCH_FAIL    = 'FOLLOWERS_FETCH_FAIL';

const FOLLOWERS_EXPAND_REQUEST = 'FOLLOWERS_EXPAND_REQUEST';
const FOLLOWERS_EXPAND_SUCCESS = 'FOLLOWERS_EXPAND_SUCCESS';
const FOLLOWERS_EXPAND_FAIL    = 'FOLLOWERS_EXPAND_FAIL';

const FOLLOWING_FETCH_REQUEST = 'FOLLOWING_FETCH_REQUEST';
const FOLLOWING_FETCH_SUCCESS = 'FOLLOWING_FETCH_SUCCESS';
const FOLLOWING_FETCH_FAIL    = 'FOLLOWING_FETCH_FAIL';

const FOLLOWING_EXPAND_REQUEST = 'FOLLOWING_EXPAND_REQUEST';
const FOLLOWING_EXPAND_SUCCESS = 'FOLLOWING_EXPAND_SUCCESS';
const FOLLOWING_EXPAND_FAIL    = 'FOLLOWING_EXPAND_FAIL';

const RELATIONSHIPS_FETCH_REQUEST = 'RELATIONSHIPS_FETCH_REQUEST';
const RELATIONSHIPS_FETCH_SUCCESS = 'RELATIONSHIPS_FETCH_SUCCESS';
const RELATIONSHIPS_FETCH_FAIL    = 'RELATIONSHIPS_FETCH_FAIL';

const FOLLOW_REQUESTS_FETCH_REQUEST = 'FOLLOW_REQUESTS_FETCH_REQUEST';
const FOLLOW_REQUESTS_FETCH_SUCCESS = 'FOLLOW_REQUESTS_FETCH_SUCCESS';
const FOLLOW_REQUESTS_FETCH_FAIL    = 'FOLLOW_REQUESTS_FETCH_FAIL';

const FOLLOW_REQUESTS_EXPAND_REQUEST = 'FOLLOW_REQUESTS_EXPAND_REQUEST';
const FOLLOW_REQUESTS_EXPAND_SUCCESS = 'FOLLOW_REQUESTS_EXPAND_SUCCESS';
const FOLLOW_REQUESTS_EXPAND_FAIL    = 'FOLLOW_REQUESTS_EXPAND_FAIL';

const FOLLOW_REQUEST_AUTHORIZE_REQUEST = 'FOLLOW_REQUEST_AUTHORIZE_REQUEST';
const FOLLOW_REQUEST_AUTHORIZE_SUCCESS = 'FOLLOW_REQUEST_AUTHORIZE_SUCCESS';
const FOLLOW_REQUEST_AUTHORIZE_FAIL    = 'FOLLOW_REQUEST_AUTHORIZE_FAIL';

const FOLLOW_REQUEST_REJECT_REQUEST = 'FOLLOW_REQUEST_REJECT_REQUEST';
const FOLLOW_REQUEST_REJECT_SUCCESS = 'FOLLOW_REQUEST_REJECT_SUCCESS';
const FOLLOW_REQUEST_REJECT_FAIL    = 'FOLLOW_REQUEST_REJECT_FAIL';

const NOTIFICATION_SETTINGS_REQUEST = 'NOTIFICATION_SETTINGS_REQUEST';
const NOTIFICATION_SETTINGS_SUCCESS = 'NOTIFICATION_SETTINGS_SUCCESS';
const NOTIFICATION_SETTINGS_FAIL    = 'NOTIFICATION_SETTINGS_FAIL';

const BIRTHDAY_REMINDERS_FETCH_REQUEST = 'BIRTHDAY_REMINDERS_FETCH_REQUEST';
const BIRTHDAY_REMINDERS_FETCH_SUCCESS = 'BIRTHDAY_REMINDERS_FETCH_SUCCESS';
const BIRTHDAY_REMINDERS_FETCH_FAIL    = 'BIRTHDAY_REMINDERS_FETCH_FAIL';

const maybeRedirectLogin = (error: { response: PlfeResponse }, history?: History) => {
  // The client is unauthorized - redirect to login.
  if (history && error?.response?.status === 401) {
    history.push('/login');
  }
};

const noOp = () => new Promise(f => f(undefined));

const createAccount = (params: Record<string, any>) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ACCOUNT_CREATE_REQUEST, params });
    return api(getState, 'app')('/api/v1/accounts', {
      method: 'POST',
      body: JSON.stringify(params),
    }).then(({ json: token }) =>
      dispatch({ type: ACCOUNT_CREATE_SUCCESS, params, token }),
    ).catch(error => {
      dispatch({ type: ACCOUNT_CREATE_FAIL, error, params });
      throw error;
    });
  };

const fetchAccount = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchRelationships([id]));

    const account = selectAccount(getState(), id);

    if (account) {
      return Promise.resolve(null);
    }

    dispatch(fetchAccountRequest(id));

    return api(getState)(`/api/v1/accounts/${id}`)
      .then(response => {
        dispatch(importFetchedAccount(response.json));
        dispatch(fetchAccountSuccess(response.json));
      })
      .catch(error => {
        dispatch(fetchAccountFail(id, error));
      });
  };

const fetchAccountByUsername = (username: string, history?: History) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { instance, me } = getState();
    const features = getFeatures(instance);

    if (features.accountByUsername && (me || !features.accountLookup)) {
      return api(getState)(`/api/v1/accounts/${username}`).then(response => {
        dispatch(fetchRelationships([response.json.id]));
        dispatch(importFetchedAccount(response.json));
        dispatch(fetchAccountSuccess(response.json));
      }).catch(error => {
        dispatch(fetchAccountFail(null, error));
        dispatch(importErrorWhileFetchingAccountByUsername(username));
      });
    } else if (features.accountLookup) {
      return dispatch(accountLookup(username)).then(account => {
        dispatch(fetchRelationships([account.id]));
        dispatch(fetchAccountSuccess(account));
      }).catch(error => {
        dispatch(fetchAccountFail(null, error));
        dispatch(importErrorWhileFetchingAccountByUsername(username));
        maybeRedirectLogin(error, history);
      });
    } else {
      return dispatch(accountSearch({
        q: username,
        limit: 5,
        resolve: true,
      })).then(accounts => {
        const found = accounts.find((a: APIEntity) => a.acct === username);

        if (found) {
          dispatch(fetchRelationships([found.id]));
          dispatch(fetchAccountSuccess(found));
        } else {
          throw accounts;
        }
      }).catch(error => {
        dispatch(fetchAccountFail(null, error));
        dispatch(importErrorWhileFetchingAccountByUsername(username));
      });
    }
  };

const fetchAccountRequest = (id: string) => ({
  type: ACCOUNT_FETCH_REQUEST,
  id,
});

const fetchAccountSuccess = (account: APIEntity) => ({
  type: ACCOUNT_FETCH_SUCCESS,
  account,
});

const fetchAccountFail = (id: string | null, error: unknown) => ({
  type: ACCOUNT_FETCH_FAIL,
  id,
  error,
  skipAlert: true,
});

const blockAccount = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(blockAccountRequest(id));

    return api(getState)(`/api/v1/accounts/${id}/block`, { method: 'POST' })
      .then(response => {
        dispatch(importEntities([response.json], Entities.RELATIONSHIPS));
        // Pass in entire statuses map so we can use it to filter stuff in different parts of the reducers
        return dispatch(blockAccountSuccess(response.json, getState().statuses));
      }).catch(error => dispatch(blockAccountFail(error)));
  };

const unblockAccount = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(unblockAccountRequest(id));

    return api(getState)(`/api/v1/accounts/${id}/unblock`, { method: 'POST' })
      .then(response => {
        dispatch(importEntities([response.json], Entities.RELATIONSHIPS));
        return dispatch(unblockAccountSuccess(response.json));
      })
      .catch(error => dispatch(unblockAccountFail(error)));
  };

const blockAccountRequest = (id: string) => ({
  type: ACCOUNT_BLOCK_REQUEST,
  id,
});

const blockAccountSuccess = (relationship: APIEntity, statuses: ImmutableMap<string, Status>) => ({
  type: ACCOUNT_BLOCK_SUCCESS,
  relationship,
  statuses,
});

const blockAccountFail = (error: unknown) => ({
  type: ACCOUNT_BLOCK_FAIL,
  error,
});

const unblockAccountRequest = (id: string) => ({
  type: ACCOUNT_UNBLOCK_REQUEST,
  id,
});

const unblockAccountSuccess = (relationship: APIEntity) => ({
  type: ACCOUNT_UNBLOCK_SUCCESS,
  relationship,
});

const unblockAccountFail = (error: unknown) => ({
  type: ACCOUNT_UNBLOCK_FAIL,
  error,
});

const muteAccount = (id: string, notifications?: boolean, duration = 0) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(muteAccountRequest(id));

    const params: Record<string, any> = {
      notifications,
    };

    if (duration) {
      const state = getState();
      const instance = state.instance;
      const v = parseVersion(instance.version);

      if (v.software === PLEROMA) {
        params.expires_in = duration;
      } else {
        params.duration = duration;
      }
    }

    return api(getState)(`/api/v1/accounts/${id}/mute`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
      .then(response => {
        dispatch(importEntities([response.json], Entities.RELATIONSHIPS));
        // Pass in entire statuses map so we can use it to filter stuff in different parts of the reducers
        return dispatch(muteAccountSuccess(response.json, getState().statuses));
      })
      .catch(error => dispatch(muteAccountFail(error)));
  };

const unmuteAccount = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(unmuteAccountRequest(id));

    return api(getState)(`/api/v1/accounts/${id}/unmute`, { method: 'POST' })
      .then(response => {
        dispatch(importEntities([response.json], Entities.RELATIONSHIPS));
        return dispatch(unmuteAccountSuccess(response.json));
      })
      .catch(error => dispatch(unmuteAccountFail(error)));
  };

const muteAccountRequest = (id: string) => ({
  type: ACCOUNT_MUTE_REQUEST,
  id,
});

const muteAccountSuccess = (relationship: APIEntity, statuses: ImmutableMap<string, Status>) => ({
  type: ACCOUNT_MUTE_SUCCESS,
  relationship,
  statuses,
});

const muteAccountFail = (error: unknown) => ({
  type: ACCOUNT_MUTE_FAIL,
  error,
});

const unmuteAccountRequest = (id: string) => ({
  type: ACCOUNT_UNMUTE_REQUEST,
  id,
});

const unmuteAccountSuccess = (relationship: APIEntity) => ({
  type: ACCOUNT_UNMUTE_SUCCESS,
  relationship,
});

const unmuteAccountFail = (error: unknown) => ({
  type: ACCOUNT_UNMUTE_FAIL,
  error,
});

const subscribeAccount = (id: string, notifications?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(subscribeAccountRequest(id));

    return api(getState)(`/api/v1/pleroma/accounts/${id}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ notifications }),
    }).then(response => dispatch(subscribeAccountSuccess(response.json)))
      .catch(error => dispatch(subscribeAccountFail(error)));
  };

const unsubscribeAccount = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(unsubscribeAccountRequest(id));

    return api(getState)(`/api/v1/pleroma/accounts/${id}/unsubscribe`, { method: 'POST' })
      .then(response => dispatch(unsubscribeAccountSuccess(response.json)))
      .catch(error => dispatch(unsubscribeAccountFail(error)));
  };

const subscribeAccountRequest = (id: string) => ({
  type: ACCOUNT_SUBSCRIBE_REQUEST,
  id,
});

const subscribeAccountSuccess = (relationship: APIEntity) => ({
  type: ACCOUNT_SUBSCRIBE_SUCCESS,
  relationship,
});

const subscribeAccountFail = (error: unknown) => ({
  type: ACCOUNT_SUBSCRIBE_FAIL,
  error,
});

const unsubscribeAccountRequest = (id: string) => ({
  type: ACCOUNT_UNSUBSCRIBE_REQUEST,
  id,
});

const unsubscribeAccountSuccess = (relationship: APIEntity) => ({
  type: ACCOUNT_UNSUBSCRIBE_SUCCESS,
  relationship,
});

const unsubscribeAccountFail = (error: unknown) => ({
  type: ACCOUNT_UNSUBSCRIBE_FAIL,
  error,
});

const removeFromFollowers = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(removeFromFollowersRequest(id));

    return api(getState)(`/api/v1/accounts/${id}/remove_from_followers`, {
      method: 'POST',
    })
      .then(response => dispatch(removeFromFollowersSuccess(response.json)))
      .catch(error => dispatch(removeFromFollowersFail(id, error)));
  };

const removeFromFollowersRequest = (id: string) => ({
  type: ACCOUNT_REMOVE_FROM_FOLLOWERS_REQUEST,
  id,
});

const removeFromFollowersSuccess = (relationship: APIEntity) => ({
  type: ACCOUNT_REMOVE_FROM_FOLLOWERS_SUCCESS,
  relationship,
});

const removeFromFollowersFail = (id: string, error: unknown) => ({
  type: ACCOUNT_REMOVE_FROM_FOLLOWERS_FAIL,
  id,
  error,
});

const fetchFollowers = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchFollowersRequest(id));

    return api(getState)(`/api/v1/accounts/${id}/followers`)
      .then(response => {
        const next = getLinks(response).refs.find(link => link.rel === 'next');

        dispatch(importFetchedAccounts(response.json));
        dispatch(fetchFollowersSuccess(id, response.json, next ? next.uri : null));
        dispatch(fetchRelationships(response.json.map((item: APIEntity) => item.id)));
      })
      .catch(error => {
        dispatch(fetchFollowersFail(id, error));
      });
  };

const fetchFollowersRequest = (id: string) => ({
  type: FOLLOWERS_FETCH_REQUEST,
  id,
});

const fetchFollowersSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: FOLLOWERS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchFollowersFail = (id: string, error: unknown) => ({
  type: FOLLOWERS_FETCH_FAIL,
  id,
  error,
});

const expandFollowers = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const url = getState().user_lists.followers.get(id)?.next as string;

    if (url === null) {
      return null;
    }

    dispatch(expandFollowersRequest(id));

    return api(getState)(url)
      .then(response => {
        const next = getLinks(response).refs.find(link => link.rel === 'next');

        dispatch(importFetchedAccounts(response.json));
        dispatch(expandFollowersSuccess(id, response.json, next ? next.uri : null));
        dispatch(fetchRelationships(response.json.map((item: APIEntity) => item.id)));
      })
      .catch(error => {
        dispatch(expandFollowersFail(id, error));
      });
  };

const expandFollowersRequest = (id: string) => ({
  type: FOLLOWERS_EXPAND_REQUEST,
  id,
});

const expandFollowersSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: FOLLOWERS_EXPAND_SUCCESS,
  id,
  accounts,
  next,
});

const expandFollowersFail = (id: string, error: unknown) => ({
  type: FOLLOWERS_EXPAND_FAIL,
  id,
  error,
});

const fetchFollowing = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchFollowingRequest(id));

    return api(getState)(`/api/v1/accounts/${id}/following`)
      .then(response => {
        const next = getLinks(response).refs.find(link => link.rel === 'next');

        dispatch(importFetchedAccounts(response.json));
        dispatch(fetchFollowingSuccess(id, response.json, next ? next.uri : null));
        dispatch(fetchRelationships(response.json.map((item: APIEntity) => item.id)));
      })
      .catch(error => {
        dispatch(fetchFollowingFail(id, error));
      });
  };

const fetchFollowingRequest = (id: string) => ({
  type: FOLLOWING_FETCH_REQUEST,
  id,
});

const fetchFollowingSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: FOLLOWING_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchFollowingFail = (id: string, error: unknown) => ({
  type: FOLLOWING_FETCH_FAIL,
  id,
  error,
});

const expandFollowing = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const url = getState().user_lists.following.get(id)!.next;

    if (url === null) {
      return null;
    }

    dispatch(expandFollowingRequest(id));

    return api(getState)(url)
      .then(response => {
        const next = getLinks(response).refs.find(link => link.rel === 'next');

        dispatch(importFetchedAccounts(response.json));
        dispatch(expandFollowingSuccess(id, response.json, next ? next.uri : null));
        dispatch(fetchRelationships(response.json.map((item: APIEntity) => item.id)));
      })
      .catch(error => {
        dispatch(expandFollowingFail(id, error));
      });
  };

const expandFollowingRequest = (id: string) => ({
  type: FOLLOWING_EXPAND_REQUEST,
  id,
});

const expandFollowingSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: FOLLOWING_EXPAND_SUCCESS,
  id,
  accounts,
  next,
});

const expandFollowingFail = (id: string, error: unknown) => ({
  type: FOLLOWING_EXPAND_FAIL,
  id,
  error,
});

const fetchRelationships = (accountIds: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const loadedRelationships = getState().relationships;
    const newAccountIds = accountIds.filter(id => loadedRelationships.get(id, null) === null);

    if (newAccountIds.length === 0) {
      return null;
    }

    dispatch(fetchRelationshipsRequest(newAccountIds));

    return api(getState)(`/api/v1/accounts/relationships?${newAccountIds.map(id => `id[]=${id}`).join('&')}`)
      .then(response => {
        dispatch(importEntities(response.json, Entities.RELATIONSHIPS));
        dispatch(fetchRelationshipsSuccess(response.json));
      })
      .catch(error => dispatch(fetchRelationshipsFail(error)));
  };

const fetchRelationshipsRequest = (ids: string[]) => ({
  type: RELATIONSHIPS_FETCH_REQUEST,
  ids,
  skipLoading: true,
});

const fetchRelationshipsSuccess = (relationships: APIEntity[]) => ({
  type: RELATIONSHIPS_FETCH_SUCCESS,
  relationships,
  skipLoading: true,
});

const fetchRelationshipsFail = (error: unknown) => ({
  type: RELATIONSHIPS_FETCH_FAIL,
  error,
  skipLoading: true,
});

const fetchFollowRequests = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(fetchFollowRequestsRequest());

    return api(getState)('/api/v1/follow_requests')
      .then(response => {
        const next = getLinks(response).refs.find(link => link.rel === 'next');
        dispatch(importFetchedAccounts(response.json));
        dispatch(fetchFollowRequestsSuccess(response.json, next ? next.uri : null));
      })
      .catch(error => dispatch(fetchFollowRequestsFail(error)));
  };

const fetchFollowRequestsRequest = () => ({
  type: FOLLOW_REQUESTS_FETCH_REQUEST,
});

const fetchFollowRequestsSuccess = (accounts: APIEntity[], next: string | null) => ({
  type: FOLLOW_REQUESTS_FETCH_SUCCESS,
  accounts,
  next,
});

const fetchFollowRequestsFail = (error: unknown) => ({
  type: FOLLOW_REQUESTS_FETCH_FAIL,
  error,
});

const expandFollowRequests = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const url = getState().user_lists.follow_requests.next;

    if (url === null) {
      return null;
    }

    dispatch(expandFollowRequestsRequest());

    return api(getState)(url)
      .then(response => {
        const next = getLinks(response).refs.find(link => link.rel === 'next');
        dispatch(importFetchedAccounts(response.json));
        dispatch(expandFollowRequestsSuccess(response.json, next ? next.uri : null));
      })
      .catch(error => dispatch(expandFollowRequestsFail(error)));
  };

const expandFollowRequestsRequest = () => ({
  type: FOLLOW_REQUESTS_EXPAND_REQUEST,
});

const expandFollowRequestsSuccess = (accounts: APIEntity[], next: string | null) => ({
  type: FOLLOW_REQUESTS_EXPAND_SUCCESS,
  accounts,
  next,
});

const expandFollowRequestsFail = (error: unknown) => ({
  type: FOLLOW_REQUESTS_EXPAND_FAIL,
  error,
});

const authorizeFollowRequest = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    dispatch(authorizeFollowRequestRequest(id));

    return api(getState)(`/api/v1/follow_requests/${id}/authorize`, { method: 'POST' })
      .then(() => dispatch(authorizeFollowRequestSuccess(id)))
      .catch(error => dispatch(authorizeFollowRequestFail(id, error)));
  };

const authorizeFollowRequestRequest = (id: string) => ({
  type: FOLLOW_REQUEST_AUTHORIZE_REQUEST,
  id,
});

const authorizeFollowRequestSuccess = (id: string) => ({
  type: FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  id,
});

const authorizeFollowRequestFail = (id: string, error: unknown) => ({
  type: FOLLOW_REQUEST_AUTHORIZE_FAIL,
  id,
  error,
});

const rejectFollowRequest = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(rejectFollowRequestRequest(id));

    api(getState)(`/api/v1/follow_requests/${id}/reject`, { method: 'POST' })
      .then(() => dispatch(rejectFollowRequestSuccess(id)))
      .catch(error => dispatch(rejectFollowRequestFail(id, error)));
  };

const rejectFollowRequestRequest = (id: string) => ({
  type: FOLLOW_REQUEST_REJECT_REQUEST,
  id,
});

const rejectFollowRequestSuccess = (id: string) => ({
  type: FOLLOW_REQUEST_REJECT_SUCCESS,
  id,
});

const rejectFollowRequestFail = (id: string, error: unknown) => ({
  type: FOLLOW_REQUEST_REJECT_FAIL,
  id,
  error,
});

const pinAccount = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp);

    dispatch(pinAccountRequest(id));

    return api(getState)(`/api/v1/accounts/${id}/pin`, { method: 'POST' }).then(response => {
      dispatch(pinAccountSuccess(response.json));
    }).catch(error => {
      dispatch(pinAccountFail(error));
    });
  };

const unpinAccount = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp);

    dispatch(unpinAccountRequest(id));

    return api(getState)(`/api/v1/accounts/${id}/unpin`, { method: 'POST' }).then(response => {
      dispatch(unpinAccountSuccess(response.json));
    }).catch(error => {
      dispatch(unpinAccountFail(error));
    });
  };

const updateNotificationSettings = (params: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: NOTIFICATION_SETTINGS_REQUEST, params });
    return api(getState)('/api/pleroma/notification_settings', {
      method: 'PUT',
      body: JSON.stringify(params),
    }).then(({ json: data }) => {
      dispatch({ type: NOTIFICATION_SETTINGS_SUCCESS, params, data });
    }).catch(error => {
      dispatch({ type: NOTIFICATION_SETTINGS_FAIL, params, error });
      throw error;
    });
  };

const pinAccountRequest = (id: string) => ({
  type: ACCOUNT_PIN_REQUEST,
  id,
});

const pinAccountSuccess = (relationship: APIEntity) => ({
  type: ACCOUNT_PIN_SUCCESS,
  relationship,
});

const pinAccountFail = (error: unknown) => ({
  type: ACCOUNT_PIN_FAIL,
  error,
});

const unpinAccountRequest = (id: string) => ({
  type: ACCOUNT_UNPIN_REQUEST,
  id,
});

const unpinAccountSuccess = (relationship: APIEntity) => ({
  type: ACCOUNT_UNPIN_SUCCESS,
  relationship,
});

const unpinAccountFail = (error: unknown) => ({
  type: ACCOUNT_UNPIN_FAIL,
  error,
});

const fetchPinnedAccounts = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchPinnedAccountsRequest(id));

    api(getState)(`/api/v1/pleroma/accounts/${id}/endorsements`).then(response => {
      dispatch(importFetchedAccounts(response.json));
      dispatch(fetchPinnedAccountsSuccess(id, response.json, null));
    }).catch(error => {
      dispatch(fetchPinnedAccountsFail(id, error));
    });
  };

const fetchPinnedAccountsRequest = (id: string) => ({
  type: PINNED_ACCOUNTS_FETCH_REQUEST,
  id,
});

const fetchPinnedAccountsSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: PINNED_ACCOUNTS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchPinnedAccountsFail = (id: string, error: unknown) => ({
  type: PINNED_ACCOUNTS_FETCH_FAIL,
  id,
  error,
});

const accountSearch = (params: Record<string, any>, signal?: AbortSignal) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ACCOUNT_SEARCH_REQUEST, params });
    return api(getState)('/api/v1/accounts/search', { params, signal }).then(({ json: accounts }) => {
      dispatch(importFetchedAccounts(accounts));
      dispatch({ type: ACCOUNT_SEARCH_SUCCESS, accounts });
      return accounts;
    }).catch(error => {
      dispatch({ type: ACCOUNT_SEARCH_FAIL, skipAlert: true });
      throw error;
    });
  };

const accountLookup = (acct: string, signal?: AbortSignal) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ACCOUNT_LOOKUP_REQUEST, acct });
    return api(getState)('/api/v1/accounts/lookup', {
      body: JSON.stringify({ acct }),
      signal,
    }).then(({ json: account }) => {
      if (account && account.id) dispatch(importFetchedAccount(account));
      dispatch({ type: ACCOUNT_LOOKUP_SUCCESS, account });
      return account;
    }).catch(error => {
      dispatch({ type: ACCOUNT_LOOKUP_FAIL });
      throw error;
    });
  };

const fetchBirthdayReminders = (month: number, day: number) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const me = getState().me;

    dispatch({ type: BIRTHDAY_REMINDERS_FETCH_REQUEST, day, month, id: me });

    return api(getState)('/api/v1/pleroma/birthdays', { params: { day, month } }).then(response => {
      dispatch(importFetchedAccounts(response.json));
      dispatch({
        type: BIRTHDAY_REMINDERS_FETCH_SUCCESS,
        accounts: response.json,
        day,
        month,
        id: me,
      });
    }).catch(error => {
      dispatch({ type: BIRTHDAY_REMINDERS_FETCH_FAIL, day, month, id: me });
    });
  };

export {
  ACCOUNT_CREATE_REQUEST,
  ACCOUNT_CREATE_SUCCESS,
  ACCOUNT_CREATE_FAIL,
  ACCOUNT_FETCH_REQUEST,
  ACCOUNT_FETCH_SUCCESS,
  ACCOUNT_FETCH_FAIL,
  ACCOUNT_BLOCK_REQUEST,
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_BLOCK_FAIL,
  ACCOUNT_UNBLOCK_REQUEST,
  ACCOUNT_UNBLOCK_SUCCESS,
  ACCOUNT_UNBLOCK_FAIL,
  ACCOUNT_MUTE_REQUEST,
  ACCOUNT_MUTE_SUCCESS,
  ACCOUNT_MUTE_FAIL,
  ACCOUNT_UNMUTE_REQUEST,
  ACCOUNT_UNMUTE_SUCCESS,
  ACCOUNT_UNMUTE_FAIL,
  ACCOUNT_SUBSCRIBE_REQUEST,
  ACCOUNT_SUBSCRIBE_SUCCESS,
  ACCOUNT_SUBSCRIBE_FAIL,
  ACCOUNT_UNSUBSCRIBE_REQUEST,
  ACCOUNT_UNSUBSCRIBE_SUCCESS,
  ACCOUNT_UNSUBSCRIBE_FAIL,
  ACCOUNT_PIN_REQUEST,
  ACCOUNT_PIN_SUCCESS,
  ACCOUNT_PIN_FAIL,
  ACCOUNT_UNPIN_REQUEST,
  ACCOUNT_UNPIN_SUCCESS,
  ACCOUNT_UNPIN_FAIL,
  ACCOUNT_REMOVE_FROM_FOLLOWERS_REQUEST,
  ACCOUNT_REMOVE_FROM_FOLLOWERS_SUCCESS,
  ACCOUNT_REMOVE_FROM_FOLLOWERS_FAIL,
  PINNED_ACCOUNTS_FETCH_REQUEST,
  PINNED_ACCOUNTS_FETCH_SUCCESS,
  PINNED_ACCOUNTS_FETCH_FAIL,
  ACCOUNT_SEARCH_REQUEST,
  ACCOUNT_SEARCH_SUCCESS,
  ACCOUNT_SEARCH_FAIL,
  ACCOUNT_LOOKUP_REQUEST,
  ACCOUNT_LOOKUP_SUCCESS,
  ACCOUNT_LOOKUP_FAIL,
  FOLLOWERS_FETCH_REQUEST,
  FOLLOWERS_FETCH_SUCCESS,
  FOLLOWERS_FETCH_FAIL,
  FOLLOWERS_EXPAND_REQUEST,
  FOLLOWERS_EXPAND_SUCCESS,
  FOLLOWERS_EXPAND_FAIL,
  FOLLOWING_FETCH_REQUEST,
  FOLLOWING_FETCH_SUCCESS,
  FOLLOWING_FETCH_FAIL,
  FOLLOWING_EXPAND_REQUEST,
  FOLLOWING_EXPAND_SUCCESS,
  FOLLOWING_EXPAND_FAIL,
  RELATIONSHIPS_FETCH_REQUEST,
  RELATIONSHIPS_FETCH_SUCCESS,
  RELATIONSHIPS_FETCH_FAIL,
  FOLLOW_REQUESTS_FETCH_REQUEST,
  FOLLOW_REQUESTS_FETCH_SUCCESS,
  FOLLOW_REQUESTS_FETCH_FAIL,
  FOLLOW_REQUESTS_EXPAND_REQUEST,
  FOLLOW_REQUESTS_EXPAND_SUCCESS,
  FOLLOW_REQUESTS_EXPAND_FAIL,
  FOLLOW_REQUEST_AUTHORIZE_REQUEST,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_FAIL,
  FOLLOW_REQUEST_REJECT_REQUEST,
  FOLLOW_REQUEST_REJECT_SUCCESS,
  FOLLOW_REQUEST_REJECT_FAIL,
  NOTIFICATION_SETTINGS_REQUEST,
  NOTIFICATION_SETTINGS_SUCCESS,
  NOTIFICATION_SETTINGS_FAIL,
  BIRTHDAY_REMINDERS_FETCH_REQUEST,
  BIRTHDAY_REMINDERS_FETCH_SUCCESS,
  BIRTHDAY_REMINDERS_FETCH_FAIL,
  createAccount,
  fetchAccount,
  fetchAccountByUsername,
  fetchAccountRequest,
  fetchAccountSuccess,
  fetchAccountFail,
  blockAccount,
  unblockAccount,
  blockAccountRequest,
  blockAccountSuccess,
  blockAccountFail,
  unblockAccountRequest,
  unblockAccountSuccess,
  unblockAccountFail,
  muteAccount,
  unmuteAccount,
  muteAccountRequest,
  muteAccountSuccess,
  muteAccountFail,
  unmuteAccountRequest,
  unmuteAccountSuccess,
  unmuteAccountFail,
  subscribeAccount,
  unsubscribeAccount,
  subscribeAccountRequest,
  subscribeAccountSuccess,
  subscribeAccountFail,
  unsubscribeAccountRequest,
  unsubscribeAccountSuccess,
  unsubscribeAccountFail,
  removeFromFollowers,
  removeFromFollowersRequest,
  removeFromFollowersSuccess,
  removeFromFollowersFail,
  fetchFollowers,
  fetchFollowersRequest,
  fetchFollowersSuccess,
  fetchFollowersFail,
  expandFollowers,
  expandFollowersRequest,
  expandFollowersSuccess,
  expandFollowersFail,
  fetchFollowing,
  fetchFollowingRequest,
  fetchFollowingSuccess,
  fetchFollowingFail,
  expandFollowing,
  expandFollowingRequest,
  expandFollowingSuccess,
  expandFollowingFail,
  fetchRelationships,
  fetchRelationshipsRequest,
  fetchRelationshipsSuccess,
  fetchRelationshipsFail,
  fetchFollowRequests,
  fetchFollowRequestsRequest,
  fetchFollowRequestsSuccess,
  fetchFollowRequestsFail,
  expandFollowRequests,
  expandFollowRequestsRequest,
  expandFollowRequestsSuccess,
  expandFollowRequestsFail,
  authorizeFollowRequest,
  authorizeFollowRequestRequest,
  authorizeFollowRequestSuccess,
  authorizeFollowRequestFail,
  rejectFollowRequest,
  rejectFollowRequestRequest,
  rejectFollowRequestSuccess,
  rejectFollowRequestFail,
  pinAccount,
  unpinAccount,
  updateNotificationSettings,
  pinAccountRequest,
  pinAccountSuccess,
  pinAccountFail,
  unpinAccountRequest,
  unpinAccountSuccess,
  unpinAccountFail,
  fetchPinnedAccounts,
  fetchPinnedAccountsRequest,
  fetchPinnedAccountsSuccess,
  fetchPinnedAccountsFail,
  accountSearch,
  accountLookup,
  fetchBirthdayReminders,
};

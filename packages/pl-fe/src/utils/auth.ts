import { List as ImmutableList } from 'immutable';

import { selectAccount, selectOwnAccount } from 'pl-fe/selectors';

import type { RootState } from 'pl-fe/store';

const validId = (id: any) => typeof id === 'string' && id !== 'null' && id !== 'undefined';

const isURL = (url?: string | null) => {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const parseBaseURL = (url: any) => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

const getLoggedInAccount = (state: RootState) => selectOwnAccount(state);

const isLoggedIn = (getState: () => RootState) => validId(getState().me);

const getUserToken = (state: RootState, accountId?: string | false | null) => {
  if (!accountId) return;
  const accountUrl = selectAccount(state, accountId)?.url;
  if (!accountUrl) return;
  return state.auth.users.get(accountUrl)?.access_token;
};

const getAccessToken = (state: RootState) => {
  const me = state.me;
  return getUserToken(state, me);
};

const getAuthUserId = (state: RootState) => {
  const me = state.auth.me;

  return ImmutableList([
    state.auth.users.get(me!)?.id,
    me,
  ].filter(id => id)).find(validId);
};

const getAuthUserUrl = (state: RootState) => {
  const me = state.auth.me;

  return ImmutableList([
    state.auth.users.get(me!)?.url,
    me,
  ].filter(url => url)).find(isURL);
};

/** Get the VAPID public key. */
const getVapidKey = (state: RootState) =>
  state.auth.app?.vapid_key || state.instance.configuration.vapid.public_key;

const getMeUrl = (state: RootState) => selectOwnAccount(state)?.url;

export {
  validId,
  isURL,
  parseBaseURL,
  getLoggedInAccount,
  isLoggedIn,
  getAccessToken,
  getAuthUserId,
  getAuthUserUrl,
  getVapidKey,
  getMeUrl,
};

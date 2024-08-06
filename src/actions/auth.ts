/**
 * Auth: login & registration workflow.
 * This file contains abstractions over auth concepts.
 * @module soapbox/actions/auth
 * @see module:soapbox/actions/apps
 * @see module:soapbox/actions/oauth
 * @see module:soapbox/actions/security
*/
import { PlApiClient, type CreateAccountParams, type Token } from 'pl-api';
import { defineMessages } from 'react-intl';

import { createAccount } from 'soapbox/actions/accounts';
import { createApp } from 'soapbox/actions/apps';
import { fetchMeSuccess, fetchMeFail } from 'soapbox/actions/me';
import { obtainOAuthToken, revokeOAuthToken } from 'soapbox/actions/oauth';
import { startOnboarding } from 'soapbox/actions/onboarding';
import * as BuildConfig from 'soapbox/build-config';
import { custom } from 'soapbox/custom';
import { queryClient } from 'soapbox/queries/client';
import { selectAccount } from 'soapbox/selectors';
import { unsetSentryAccount } from 'soapbox/sentry';
import KVStore from 'soapbox/storage/kv-store';
import toast from 'soapbox/toast';
import { getLoggedInAccount, parseBaseURL } from 'soapbox/utils/auth';
import sourceCode from 'soapbox/utils/code';
import { normalizeUsername } from 'soapbox/utils/input';
import { getScopes } from 'soapbox/utils/scopes';
import { isStandalone } from 'soapbox/utils/state';

import { type PlfeResponse, getClient } from '../api';

import { importFetchedAccount } from './importer';

import type { AppDispatch, RootState } from 'soapbox/store';

const SWITCH_ACCOUNT = 'SWITCH_ACCOUNT';

const AUTH_APP_CREATED    = 'AUTH_APP_CREATED';
const AUTH_APP_AUTHORIZED = 'AUTH_APP_AUTHORIZED';
const AUTH_LOGGED_IN      = 'AUTH_LOGGED_IN';
const AUTH_LOGGED_OUT     = 'AUTH_LOGGED_OUT';

const VERIFY_CREDENTIALS_REQUEST = 'VERIFY_CREDENTIALS_REQUEST';
const VERIFY_CREDENTIALS_SUCCESS = 'VERIFY_CREDENTIALS_SUCCESS';
const VERIFY_CREDENTIALS_FAIL    = 'VERIFY_CREDENTIALS_FAIL';

const AUTH_ACCOUNT_REMEMBER_REQUEST = 'AUTH_ACCOUNT_REMEMBER_REQUEST';
const AUTH_ACCOUNT_REMEMBER_SUCCESS = 'AUTH_ACCOUNT_REMEMBER_SUCCESS';
const AUTH_ACCOUNT_REMEMBER_FAIL    = 'AUTH_ACCOUNT_REMEMBER_FAIL';

const customApp = custom('app');

const messages = defineMessages({
  loggedOut: { id: 'auth.logged_out', defaultMessage: 'Logged out.' },
  awaitingApproval: { id: 'auth.awaiting_approval', defaultMessage: 'Your account is awaiting approval' },
  invalidCredentials: { id: 'auth.invalid_credentials', defaultMessage: 'Wrong username or password' },
});

const noOp = () => new Promise(f => f(undefined));

const createAppAndToken = () =>
  (dispatch: AppDispatch) =>
    dispatch(getAuthApp()).then(() =>
      dispatch(createAppToken()),
    );

/** Create an auth app, or use it from build config */
const getAuthApp = () =>
  (dispatch: AppDispatch) => {
    if (customApp?.client_secret) {
      return noOp().then(() => dispatch({ type: AUTH_APP_CREATED, app: customApp }));
    } else {
      return dispatch(createAuthApp());
    }
  };

const createAuthApp = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const params = {
      client_name: sourceCode.displayName,
      redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: getScopes(getState()),
      website: sourceCode.homepage,
    };

    return dispatch(createApp(params)).then((app: Record<string, string>) =>
      dispatch({ type: AUTH_APP_CREATED, app }),
    );
  };

const createAppToken = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const app = getState().auth.app;

    const params = {
      client_id:     app.client_id!,
      client_secret: app.client_secret!,
      redirect_uri:  'urn:ietf:wg:oauth:2.0:oob',
      grant_type:    'client_credentials',
      scope:         getScopes(getState()),
    };

    return dispatch(obtainOAuthToken(params)).then((token: Record<string, string | number>) =>
      dispatch({ type: AUTH_APP_AUTHORIZED, app, token }),
    );
  };

const createUserToken = (username: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const app = getState().auth.app;

    const params = {
      client_id:     app.client_id!,
      client_secret: app.client_secret!,
      redirect_uri:  'urn:ietf:wg:oauth:2.0:oob',
      grant_type:    'password',
      username:      username,
      password:      password,
      scope:         getScopes(getState()),
    };

    return dispatch(obtainOAuthToken(params))
      .then((token) => dispatch(authLoggedIn(token)));
  };

const otpVerify = (code: string, mfa_token: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const app = state.auth.app;
    const baseUrl = parseBaseURL(state.me) || BuildConfig.BACKEND_URL;
    const client = new PlApiClient(baseUrl, app.access_token!, { fetchInstance: false });
    return client.request('/oauth/mfa/challenge', {
      method: 'POST',
      body: {
        client_id: app.client_id,
        client_secret: app.client_secret,
        mfa_token: mfa_token,
        code: code,
        challenge_type: 'totp',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        scope: getScopes(getState()),
      },
    }).then(({ json: token }) => dispatch(authLoggedIn(token)));
  };

const verifyCredentials = (token: string, accountUrl?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const baseURL = parseBaseURL(accountUrl) || BuildConfig.BACKEND_URL;

    dispatch({ type: VERIFY_CREDENTIALS_REQUEST, token });

    const client = new PlApiClient(baseURL, token, { fetchInstance: false });

    return client.settings.verifyCredentials().then((account) => {
      dispatch(importFetchedAccount(account));
      dispatch({ type: VERIFY_CREDENTIALS_SUCCESS, token, account });
      if (account.id === getState().me) dispatch(fetchMeSuccess(account));
      return account;
    }).catch(error => {
      if (error?.response?.status === 403 && error?.response?.json?.id) {
        // The user is waitlisted
        const account = error.response.json;
        dispatch(importFetchedAccount(account));
        dispatch({ type: VERIFY_CREDENTIALS_SUCCESS, token, account });
        if (account.id === getState().me) dispatch(fetchMeSuccess(account));
        return account;
      } else {
        if (getState().me === null) dispatch(fetchMeFail(error));
        dispatch({ type: VERIFY_CREDENTIALS_FAIL, token, error });
        throw error;
      }
    });
  };

const rememberAuthAccount = (accountUrl: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: AUTH_ACCOUNT_REMEMBER_REQUEST, accountUrl });
    return KVStore.getItemOrError(`authAccount:${accountUrl}`).then(account => {
      dispatch(importFetchedAccount(account));
      dispatch({ type: AUTH_ACCOUNT_REMEMBER_SUCCESS, account, accountUrl });
      if (account.id === getState().me) dispatch(fetchMeSuccess(account));
      return account;
    }).catch(error => {
      dispatch({ type: AUTH_ACCOUNT_REMEMBER_FAIL, error, accountUrl, skipAlert: true });
    });
  };

const loadCredentials = (token: string, accountUrl: string) =>
  (dispatch: AppDispatch) => dispatch(rememberAuthAccount(accountUrl))
    .finally(() => dispatch(verifyCredentials(token, accountUrl)));

const logIn = (username: string, password: string) =>
  (dispatch: AppDispatch) => dispatch(getAuthApp()).then(() =>
    dispatch(createUserToken(normalizeUsername(username), password)),
  ).catch((error: { response: PlfeResponse }) => {
    if ((error.response?.json as any)?.error === 'mfa_required') {
      // If MFA is required, throw the error and handle it in the component.
      throw error;
    } else if ((error.response?.json as any)?.identifier === 'awaiting_approval') {
      toast.error(messages.awaitingApproval);
    } else {
      // Return "wrong password" message.
      toast.error(messages.invalidCredentials);
    }
    throw error;
  });

const deleteSession = () =>
  (dispatch: AppDispatch, getState: () => RootState) => getClient(getState).request('/api/sign_out', { method: 'DELETE' });

const logOut = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const account = getLoggedInAccount(state);
    const standalone = isStandalone(state);

    if (!account) return dispatch(noOp);

    const params = {
      client_id: state.auth.app.client_id!,
      client_secret: state.auth.app.client_secret!,
      token: state.auth.users.get(account.url)!.access_token,
    };

    return dispatch(revokeOAuthToken(params))
      .finally(() => {
        // Clear all stored cache from React Query
        queryClient.invalidateQueries();
        queryClient.clear();

        // Clear the account from Sentry.
        unsetSentryAccount();

        dispatch({ type: AUTH_LOGGED_OUT, account, standalone });

        toast.success(messages.loggedOut);
      });
  };

const switchAccount = (accountId: string, background = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const account = selectAccount(getState(), accountId);
    // Clear all stored cache from React Query
    queryClient.invalidateQueries();
    queryClient.clear();

    return dispatch({ type: SWITCH_ACCOUNT, account, background });
  };

const fetchOwnAccounts = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    return state.auth.users.forEach((user) => {
      const account = selectAccount(state, user.id);
      if (!account) {
        dispatch(verifyCredentials(user.access_token, user.url))
          .catch(() => console.warn(`Failed to load account: ${user.url}`));
      }
    });
  };

const register = (params: CreateAccountParams) =>
  (dispatch: AppDispatch) => {
    params.fullname = params.username;

    return dispatch(createAppAndToken())
      .then(() => dispatch(createAccount(params)))
      .then(({ token }: { token: Token }) => {
        dispatch(startOnboarding());
        return dispatch(authLoggedIn(token));
      });
  };

const fetchCaptcha = () =>
  (_dispatch: AppDispatch, getState: () => RootState) => getClient(getState).request('/api/pleroma/captcha');

const authLoggedIn = (token: Token) =>
  (dispatch: AppDispatch) => {
    dispatch({ type: AUTH_LOGGED_IN, token });
    return token;
  };

export {
  SWITCH_ACCOUNT,
  AUTH_APP_CREATED,
  AUTH_APP_AUTHORIZED,
  AUTH_LOGGED_IN,
  AUTH_LOGGED_OUT,
  VERIFY_CREDENTIALS_REQUEST,
  VERIFY_CREDENTIALS_SUCCESS,
  VERIFY_CREDENTIALS_FAIL,
  AUTH_ACCOUNT_REMEMBER_REQUEST,
  AUTH_ACCOUNT_REMEMBER_SUCCESS,
  AUTH_ACCOUNT_REMEMBER_FAIL,
  messages,
  otpVerify,
  verifyCredentials,
  rememberAuthAccount,
  loadCredentials,
  logIn,
  deleteSession,
  logOut,
  switchAccount,
  fetchOwnAccounts,
  register,
  fetchCaptcha,
  authLoggedIn,
};

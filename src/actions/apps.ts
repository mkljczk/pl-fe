/**
 * Apps: manage OAuth applications.
 * Particularly useful for auth.
 * https://docs.joinmastodon.org/methods/apps/
 * @module soapbox/actions/apps
 * @see module:soapbox/actions/auth
 */

import { getFetch } from '../api';

import type { AnyAction } from 'redux';

const APP_CREATE_REQUEST = 'APP_CREATE_REQUEST';
const APP_CREATE_SUCCESS = 'APP_CREATE_SUCCESS';
const APP_CREATE_FAIL    = 'APP_CREATE_FAIL';

const APP_VERIFY_CREDENTIALS_REQUEST = 'APP_VERIFY_CREDENTIALS_REQUEST';
const APP_VERIFY_CREDENTIALS_SUCCESS = 'APP_VERIFY_CREDENTIALS_SUCCESS';
const APP_VERIFY_CREDENTIALS_FAIL    = 'APP_VERIFY_CREDENTIALS_FAIL';

const createApp = (params?: Record<string, string>, baseURL?: string) =>
  (dispatch: React.Dispatch<AnyAction>) => {
    dispatch({ type: APP_CREATE_REQUEST, params });

    return getFetch(null, baseURL)('/api/v1/apps', { method: 'POST', body: JSON.stringify(params) }).then(({ json: app }) => {
      dispatch({ type: APP_CREATE_SUCCESS, params, app });
      return app as Record<string, string>;
    }).catch(error => {
      dispatch({ type: APP_CREATE_FAIL, params, error });
      throw error;
    });
  };

const verifyAppCredentials = (token: string) =>
  (dispatch: React.Dispatch<AnyAction>) => {
    dispatch({ type: APP_VERIFY_CREDENTIALS_REQUEST, token });
    return getFetch(token)('/api/v1/apps/verify_credentials').then(({ json: app }) => {
      dispatch({ type: APP_VERIFY_CREDENTIALS_SUCCESS, token, app });
      return app;
    }).catch(error => {
      dispatch({ type: APP_VERIFY_CREDENTIALS_FAIL, token, error });
      throw error;
    });
  };

export {
  APP_CREATE_REQUEST,
  APP_CREATE_SUCCESS,
  APP_CREATE_FAIL,
  APP_VERIFY_CREDENTIALS_REQUEST,
  APP_VERIFY_CREDENTIALS_SUCCESS,
  APP_VERIFY_CREDENTIALS_FAIL,
  createApp,
  verifyAppCredentials,
};

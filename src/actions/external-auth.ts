/**
 * External Auth: workflow for logging in to remote servers.
 * @module soapbox/actions/external_auth
 * @see module:soapbox/actions/auth
 * @see module:soapbox/actions/apps
 * @see module:soapbox/actions/oauth
 */

import { createApp } from 'soapbox/actions/apps';
import { authLoggedIn, verifyCredentials, switchAccount } from 'soapbox/actions/auth';
import { obtainOAuthToken } from 'soapbox/actions/oauth';
import { instanceSchema, type Instance } from 'soapbox/schemas';
import { parseBaseURL } from 'soapbox/utils/auth';
import sourceCode from 'soapbox/utils/code';
import { getQuirks } from 'soapbox/utils/quirks';
import { getInstanceScopes } from 'soapbox/utils/scopes';

import { getFetch } from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';

const fetchExternalInstance = (baseURL?: string) =>
  getFetch(null, baseURL)('/api/v1/instance')
    .then(({ json: instance }) => instanceSchema.parse(instance))
    .catch(error => {
      if (error.response?.status === 401) {
        // Authenticated fetch is enabled.
        // Continue with a limited featureset.
        return instanceSchema.parse({});
      } else {
        throw error;
      }
    });

const createExternalApp = (instance: Instance, baseURL?: string) =>
  (dispatch: AppDispatch, _getState: () => RootState) => {
    // Mitra: skip creating the auth app
    if (getQuirks(instance).noApps) return new Promise(f => f({}));

    const params = {
      client_name: sourceCode.displayName,
      redirect_uris: `${window.location.origin}/login/external`,
      website: sourceCode.homepage,
      scopes: getInstanceScopes(instance),
    };

    return dispatch(createApp(params, baseURL));
  };

const externalAuthorize = (instance: Instance, baseURL: string) =>
  (dispatch: AppDispatch, _getState: () => RootState) => {
    const scopes = getInstanceScopes(instance);

    return dispatch(createExternalApp(instance, baseURL)).then((app) => {
      const { client_id, redirect_uri } = app as Record<string, string>;

      const query = new URLSearchParams({
        client_id,
        redirect_uri,
        response_type: 'code',
        scope: scopes,
      });

      localStorage.setItem('plfe:external:app', JSON.stringify(app));
      localStorage.setItem('plfe:external:baseurl', baseURL);
      localStorage.setItem('plfe:external:scopes', scopes);

      window.location.href = `${baseURL}/oauth/authorize?${query.toString()}`;
    });
  };

const externalLogin = (host: string) =>
  (dispatch: AppDispatch) => {
    const baseURL = parseBaseURL(host) || parseBaseURL(`https://${host}`);

    return fetchExternalInstance(baseURL).then((instance) => {
      dispatch(externalAuthorize(instance, baseURL));
    });
  };

const loginWithCode = (code: string) =>
  (dispatch: AppDispatch) => {
    const { client_id, client_secret, redirect_uri } = JSON.parse(localStorage.getItem('plfe:external:app')!);
    const baseURL = localStorage.getItem('plfe:external:baseurl')!;
    const scope   = localStorage.getItem('plfe:external:scopes')!;

    const params: Record<string, string> = {
      client_id,
      client_secret,
      redirect_uri,
      grant_type: 'authorization_code',
      scope,
      code,
    };

    return dispatch(obtainOAuthToken(params, baseURL))
      .then((token: Record<string, string | number>) => dispatch(authLoggedIn(token)))
      .then(({ access_token }: any) => dispatch(verifyCredentials(access_token as string, baseURL)))
      .then((account: { id: string }) => dispatch(switchAccount(account.id)))
      .then(() => window.location.href = '/');
  };

export {
  externalLogin,
  loginWithCode,
};

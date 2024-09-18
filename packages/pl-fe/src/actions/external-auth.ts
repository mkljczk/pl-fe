/**
 * External Auth: workflow for logging in to remote servers.
 * @module pl-fe/actions/external_auth
 * @see module:pl-fe/actions/auth
 * @see module:pl-fe/actions/apps
 * @see module:pl-fe/actions/oauth
 */

import { type Instance, PlApiClient, instanceSchema } from 'pl-api';

import { createApp } from 'pl-fe/actions/apps';
import {
  authLoggedIn,
  switchAccount,
  verifyCredentials,
} from 'pl-fe/actions/auth';
import { obtainOAuthToken } from 'pl-fe/actions/oauth';
import { parseBaseURL } from 'pl-fe/utils/auth';
import sourceCode from 'pl-fe/utils/code';
import { getQuirks } from 'pl-fe/utils/quirks';
import { getInstanceScopes } from 'pl-fe/utils/scopes';

import type { AppDispatch } from 'pl-fe/store';

const fetchExternalInstance = (baseURL: string) =>
  new PlApiClient(baseURL).instance
    .getInstance()
    .then((instance) => instance)
    .catch((error) => {
      if (error.response?.status === 401) {
        // Authenticated fetch is enabled.
        // Continue with a limited featureset.
        return instanceSchema.parse({});
      } else {
        throw error;
      }
    });

const createExternalApp =
  (instance: Instance, baseURL?: string) => (dispatch: AppDispatch) => {
    // Mitra: skip creating the auth app
    if (getQuirks(instance).noApps) return new Promise((f) => f({}));

    const params = {
      client_name: `${sourceCode.displayName} (${new URL(window.origin).host})`,
      redirect_uris: `${window.location.origin}/login/external`,
      website: sourceCode.homepage,
      scopes: getInstanceScopes(instance),
    };

    return dispatch(createApp(params, baseURL));
  };

const externalAuthorize =
  (instance: Instance, baseURL: string) => (dispatch: AppDispatch) => {
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

const externalLogin = (host: string) => (dispatch: AppDispatch) => {
  const baseURL = parseBaseURL(host) || parseBaseURL(`https://${host}`);

  return fetchExternalInstance(baseURL).then((instance) => {
    dispatch(externalAuthorize(instance, baseURL));
  });
};

const loginWithCode = (code: string) => (dispatch: AppDispatch) => {
  const { client_id, client_secret, redirect_uri } = JSON.parse(
    localStorage.getItem('plfe:external:app')!,
  );
  const baseURL = localStorage.getItem('plfe:external:baseurl')!;
  const scope = localStorage.getItem('plfe:external:scopes')!;

  const params = {
    client_id,
    client_secret,
    redirect_uri,
    grant_type: 'authorization_code',
    scope,
    code,
  };

  return dispatch(obtainOAuthToken(params, baseURL))
    .then((token) => dispatch(authLoggedIn(token)))
    .then(({ access_token }) =>
      dispatch(verifyCredentials(access_token as string, baseURL)),
    )
    .then((account) => dispatch(switchAccount(account.id)))
    .then(() => (window.location.href = '/'));
};

export { externalLogin, loginWithCode };

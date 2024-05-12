/**
 * API: HTTP client and utilities.
 * @module soapbox/api
 */
import LinkHeader from 'http-link-header';
import { createSelector } from 'reselect';

import * as BuildConfig from 'soapbox/build-config';
import { selectAccount } from 'soapbox/selectors';
import { RootState } from 'soapbox/store';
import { getAccessToken, getAppToken, isURL, parseBaseURL } from 'soapbox/utils/auth';
import { buildFullPath } from 'soapbox/utils/url';

/**
  Parse Link headers, mostly for pagination.
  @param {object} response - Fetch API response object
  @returns {object} Link object
  */
export const getLinks = (response: Pick<Response, 'headers'>): LinkHeader => {
  return new LinkHeader(response.headers?.get('link') || undefined);
};

export const getNextLink = (response: Pick<Response, 'headers'>): string | undefined => {
  return getLinks(response).refs.find(link => link.rel === 'next')?.uri;
};

export const getPrevLink = (response: Pick<Response, 'headers'>): string | undefined => {
  return getLinks(response).refs.find(link => link.rel === 'prev')?.uri;
};

const getToken = (state: RootState, authType: string) => {
  return authType === 'app' ? getAppToken(state) : getAccessToken(state);
};

const getAuthBaseURL = createSelector([
  (state: RootState, me: string | false | null) => me ? selectAccount(state, me)?.url : undefined,
  (state: RootState, _me: string | false | null) => state.auth.me,
], (accountUrl, authUserUrl) => {
  const baseURL = parseBaseURL(accountUrl) || parseBaseURL(authUserUrl);
  return baseURL !== window.location.origin ? baseURL : '';
});

export const getFetch = (accessToken?: string | null, baseURL: string = '') =>
  <T = any>(input: URL | RequestInfo, init?: RequestInit & { params?:  Record<string, any>} | undefined) => {
    const fullPath = buildFullPath(input.toString(), isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : baseURL, init?.params);

    const headers = new Headers(init?.headers);

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    if (headers.get('Content-Type') === '') {
      headers.delete('Content-Type');
    } else {
      headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
    }

    return fetch(fullPath, {
      ...init,
      headers,
    }).then(async (response) => {
      if (!response.ok) throw { response };
      const data = await response.text();
      let json: T = undefined!;
      try {
        json = JSON.parse(data);
      } catch (e) {
        //
      }
      return { ...response, data, json };
    });
  };

/**
  * Dumb client for grabbing static files.
  * It uses FE_SUBDIRECTORY and parses JSON if possible.
  * No authorization is needed.
  */
export const staticFetch = (input: URL | RequestInfo, init?: RequestInit | undefined) => {
  const fullPath = buildFullPath(input.toString(), BuildConfig.FE_SUBDIRECTORY);

  return fetch(fullPath, init).then(async (response) => {
    if (!response.ok) throw { response };
    const data = await response.text();
    let json: any = undefined!;
    try {
      json = JSON.parse(data);
    } catch (e) {
      //
    }
    return { ...response, data, json };
  });
};

/**
  * Stateful API client.
  * Uses credentials from the Redux store if available.
  * @param {function} getState - Must return the Redux state
  * @param {string} authType - Either 'user' or 'app'
  * @returns {object} Axios instance
  */
export const api = (getState: () => RootState, authType: string = 'user') => {
  const state = getState();
  const accessToken = getToken(state, authType);
  const me = state.me;
  const baseURL = me ? getAuthBaseURL(state, me) : '';

  return getFetch(accessToken, baseURL);
};

export default api;
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

type PlfeResponse<T = any> = Response & { data: string; json: T };

/**
  Parse Link headers, mostly for pagination.
  @param {object} response - Fetch API response object
  @returns {object} Link object
  */
const getLinks = (response: Pick<Response, 'headers'>): LinkHeader =>
  new LinkHeader(response.headers?.get('link') || undefined);

const getNextLink = (response: Pick<Response, 'headers'>): string | undefined =>
  getLinks(response).refs.find(link => link.rel === 'next')?.uri;

const getPrevLink = (response: Pick<Response, 'headers'>): string | undefined =>
  getLinks(response).refs.find(link => link.rel === 'prev')?.uri;

const getToken = (state: RootState, authType: string) =>
  authType === 'app' ? getAppToken(state) : getAccessToken(state);

const getAuthBaseURL = createSelector([
  (state: RootState, me: string | false | null) => me ? selectAccount(state, me)?.url : undefined,
  (state: RootState, _me: string | false | null) => state.auth.me,
], (accountUrl, authUserUrl) => {
  const baseURL = parseBaseURL(accountUrl) || parseBaseURL(authUserUrl);
  return baseURL !== window.location.origin ? baseURL : '';
});

const getFetch = (accessToken?: string | null, baseURL: string = '') =>
  <T = any>(
    input: URL | RequestInfo,
    init?: RequestInit & { params?: Record<string, any>; onUploadProgress?: (e: ProgressEvent) => void } | undefined,
  ) => {
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

    // Fetch API doesn't report upload progress, use XHR
    if (init?.onUploadProgress) {
      return new Promise<PlfeResponse<T>>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('progress', init.onUploadProgress!);
        xhr.addEventListener('loadend', () => {
          const data = xhr.response;
          let json: T = undefined!;

          try {
            json = JSON.parse(data);
          } catch (e) {
            //
          }

          if (xhr.status >= 400) reject({ response: { status: xhr.status, data, json } });
          resolve({ status: xhr.status, data, json } as any as PlfeResponse<T>);
        });

        xhr.open(init?.method || 'GET', fullPath, true);
        headers.forEach((value, key) => xhr.setRequestHeader(key, value));
        xhr.responseType = 'text';
        xhr.send(init.body as FormData);
      });
    }

    return fetch(fullPath, {
      ...init,
      headers,
    }).then(async (res) => {
      const data = await res.text();
      let json: T = undefined!;

      try {
        json = JSON.parse(data);
      } catch (e) {
        //
      }

      const { headers, ok, redirected, status, statusText, type, url } = res;

      const response = { headers, ok, redirected, status, statusText, type, url, data, json };

      if (!ok) {
        throw { response };
      }
      return response as any as PlfeResponse<T>;
    });
  };

/**
  * Dumb client for grabbing static files.
  * It uses FE_SUBDIRECTORY and parses JSON if possible.
  * No authorization is needed.
  */
const staticFetch = (input: URL | RequestInfo, init?: RequestInit | undefined) => {
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

    const { headers, ok, redirected, status, statusText, type, url } = response;

    return { headers, ok, redirected, status, statusText, type, url, data, json } as any as PlfeResponse;
  });
};

/**
  * Stateful API client.
  * Uses credentials from the Redux store if available.
  * @param {function} getState - Must return the Redux state
  * @param {string} authType - Either 'user' or 'app'
  * @returns {object} Axios instance
  */
const api = (getState: () => RootState, authType: string = 'user') => {
  const state = getState();
  const accessToken = getToken(state, authType);
  const me = state.me;
  const baseURL = me ? getAuthBaseURL(state, me) : '';

  return getFetch(accessToken, baseURL);
};

export {
  type PlfeResponse,
  getLinks,
  getNextLink,
  getPrevLink,
  getFetch,
  staticFetch,
  api,
  api as default,
};

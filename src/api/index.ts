/**
 * API: HTTP client and utilities.
 * @module soapbox/api
 */
import LinkHeader from 'http-link-header';

import * as BuildConfig from 'soapbox/build-config';
import { RootState } from 'soapbox/store';
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

const getClient = (state: RootState | (() => RootState)) => {
  if (typeof state === 'function') state = state();

  return state.auth.client;
};

export {
  type PlfeResponse,
  getLinks,
  getNextLink,
  staticFetch,
  getClient,
};

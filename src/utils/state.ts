/**
 * State: general Redux state utility functions.
 * @module soapbox/utils/state
 */

import { getSoapboxConfig } from 'soapbox/actions/soapbox';
import * as BuildConfig from 'soapbox/build-config';
import { isPrerendered } from 'soapbox/precheck';
import { selectOwnAccount } from 'soapbox/selectors';
import { isURL } from 'soapbox/utils/auth';

import type { RootState } from 'soapbox/store';

/** Whether to display the fqn instead of the acct. */
export const displayFqn = (state: RootState): boolean => {
  return getSoapboxConfig(state).displayFqn;
};

/** Whether the instance exposes instance blocks through the API. */
export const federationRestrictionsDisclosed = (state: RootState): boolean => {
  return !!state.instance.pleroma.metadata.federation.mrf_policies;
};

/**
 * Determine whether pl-fe is running in standalone mode.
 * Standalone mode runs separately from any backend and can login anywhere.
 */
export const isStandalone = (state: RootState): boolean => {
  const instanceFetchFailed = state.meta.instance_fetch_failed;
  return isURL(BuildConfig.BACKEND_URL) ? false : (!isPrerendered && instanceFetchFailed);
};

const getHost = (url: any): string => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

/** Get the baseURL of the instance. */
export const getBaseURL = (state: RootState): string => {
  const account = selectOwnAccount(state);
  return isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : getHost(account?.url);
};

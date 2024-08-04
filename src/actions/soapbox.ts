import { createSelector } from 'reselect';

import { getHost } from 'soapbox/actions/instance';
import { normalizeSoapboxConfig } from 'soapbox/normalizers';
import KVStore from 'soapbox/storage/kv-store';
import { getFeatures } from 'soapbox/utils/features';

import { getClient, staticFetch } from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const SOAPBOX_CONFIG_REQUEST_SUCCESS = 'SOAPBOX_CONFIG_REQUEST_SUCCESS';
const SOAPBOX_CONFIG_REQUEST_FAIL    = 'SOAPBOX_CONFIG_REQUEST_FAIL';

const SOAPBOX_CONFIG_REMEMBER_REQUEST = 'SOAPBOX_CONFIG_REMEMBER_REQUEST';
const SOAPBOX_CONFIG_REMEMBER_SUCCESS = 'SOAPBOX_CONFIG_REMEMBER_SUCCESS';
const SOAPBOX_CONFIG_REMEMBER_FAIL    = 'SOAPBOX_CONFIG_REMEMBER_FAIL';

const getSoapboxConfig = createSelector([
  (state: RootState) => state.soapbox,
  (state: RootState) => getFeatures(state.instance),
], (soapbox, features) => {
  // Do some additional normalization with the state
  return normalizeSoapboxConfig(soapbox).withMutations(soapboxConfig => {

    // If displayFqn isn't set, infer it from federation
    if (soapbox.get('displayFqn') === undefined) {
      soapboxConfig.set('displayFqn', features.federating);
    }
  });
});

const rememberSoapboxConfig = (host: string | null) =>
  (dispatch: AppDispatch) => {
    dispatch({ type: SOAPBOX_CONFIG_REMEMBER_REQUEST, host });
    return KVStore.getItemOrError(`soapbox_config:${host}`).then(soapboxConfig => {
      dispatch({ type: SOAPBOX_CONFIG_REMEMBER_SUCCESS, host, soapboxConfig });
      return soapboxConfig;
    }).catch(error => {
      dispatch({ type: SOAPBOX_CONFIG_REMEMBER_FAIL, host, error, skipAlert: true });
    });
  };

const fetchFrontendConfigurations = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).request('/api/pleroma/frontend_configurations')
      .then(({ json: data }) => data);

/** Conditionally fetches Soapbox config depending on backend features */
const fetchSoapboxConfig = (host: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const features = getFeatures(getState().instance);

    if (features.frontendConfigurations) {
      return dispatch(fetchFrontendConfigurations()).then(data => {
        if (data.pl_fe) {
          dispatch(importSoapboxConfig(data.pl_fe, host));
          return data.pl_fe;
        } else {
          return dispatch(fetchSoapboxJson(host));
        }
      });
    } else {
      return dispatch(fetchSoapboxJson(host));
    }
  };

/** Tries to remember the config from browser storage before fetching it */
const loadSoapboxConfig = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const host = getHost(getState());

    return dispatch(rememberSoapboxConfig(host)).then(() =>
      dispatch(fetchSoapboxConfig(host)),
    );
  };

const fetchSoapboxJson = (host: string | null) =>
  (dispatch: AppDispatch) =>
    staticFetch('/instance/soapbox.json').then(({ json: data }) => {
      if (!isObject(data)) throw 'soapbox.json failed';
      dispatch(importSoapboxConfig(data, host));
      return data;
    }).catch(error => {
      dispatch(soapboxConfigFail(error, host));
    });

const importSoapboxConfig = (soapboxConfig: APIEntity, host: string | null) => {
  if (!soapboxConfig.brandColor) {
    soapboxConfig.brandColor = '#0482d8';
  }
  return {
    type: SOAPBOX_CONFIG_REQUEST_SUCCESS,
    soapboxConfig,
    host,
  };
};

const soapboxConfigFail = (error: unknown, host: string | null) => ({
  type: SOAPBOX_CONFIG_REQUEST_FAIL,
  error,
  skipAlert: true,
  host,
});

// https://stackoverflow.com/a/46663081
const isObject = (o: any) => o instanceof Object && o.constructor === Object;

export {
  SOAPBOX_CONFIG_REQUEST_SUCCESS,
  SOAPBOX_CONFIG_REQUEST_FAIL,
  SOAPBOX_CONFIG_REMEMBER_REQUEST,
  SOAPBOX_CONFIG_REMEMBER_SUCCESS,
  SOAPBOX_CONFIG_REMEMBER_FAIL,
  getSoapboxConfig,
  rememberSoapboxConfig,
  fetchFrontendConfigurations,
  fetchSoapboxConfig,
  loadSoapboxConfig,
  fetchSoapboxJson,
  importSoapboxConfig,
  soapboxConfigFail,
};

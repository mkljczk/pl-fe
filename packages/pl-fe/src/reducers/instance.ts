import { produce } from 'immer';
import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable';
import { type Instance, instanceSchema } from 'pl-api';
import * as v from 'valibot';

import { ADMIN_CONFIG_UPDATE_REQUEST, ADMIN_CONFIG_UPDATE_SUCCESS } from 'pl-fe/actions/admin';
import { INSTANCE_FETCH_FAIL, INSTANCE_FETCH_SUCCESS, InstanceAction } from 'pl-fe/actions/instance';
import { PLEROMA_PRELOAD_IMPORT, type PreloadAction } from 'pl-fe/actions/preload';
import KVStore from 'pl-fe/storage/kv-store';
import ConfigDB from 'pl-fe/utils/config-db';

import type { AnyAction } from 'redux';

const initialState: Instance = v.parse(instanceSchema, {});

const preloadImport = (state: Instance, action: Record<string, any>, path: string) => {
  const instance = action.data[path];
  return instance ? v.parse(instanceSchema, instance) : state;
};

const getConfigValue = (instanceConfig: ImmutableMap<string, any>, key: string) => {
  const v = instanceConfig
    .find(value => value.getIn(['tuple', 0]) === key);

  return v ? v.getIn(['tuple', 1]) : undefined;
};

const importConfigs = (state: Instance, configs: ImmutableList<any>) => {
  // FIXME: This is pretty hacked together. Need to make a cleaner map.
  const config = ConfigDB.find(configs, ':pleroma', ':instance');
  const simplePolicy = ConfigDB.toSimplePolicy(configs);

  if (!config && !simplePolicy) return state;

  return produce(state, (draft) => {
    if (config) {
      const value = config.get('value', ImmutableList());
      const registrationsOpen = getConfigValue(value, ':registrations_open') as boolean | undefined;
      const approvalRequired = getConfigValue(value, ':account_approval_required') as boolean | undefined;

      draft.registrations = {
        enabled: registrationsOpen ?? draft.registrations.enabled,
        approval_required: approvalRequired ?? draft.registrations.approval_required,
      };
    }

    if (simplePolicy) {
      draft.pleroma.metadata.federation.mrf_simple = simplePolicy;
    }
  });
};

const handleAuthFetch = (state: Instance) => {
  // Authenticated fetch is enabled, so make the instance appear censored
  return {
    ...state,
    title: state.title || '██████',
    description: state.description || '████████████',
  };
};

const getHost = (instance: { domain: string }) => {
  const domain = instance.domain;
  try {
    return new URL(domain).host;
  } catch {
    try {
      return new URL(`https://${domain}`).host;
    } catch {
      return null;
    }
  }
};

const persistInstance = (instance: { domain: string }, host: string | null = getHost(instance)) => {
  if (host) {
    KVStore.setItem(`instance:${host}`, instance).catch(console.error);
  }
};

const handleInstanceFetchFail = (state: Instance, error: Record<string, any>) => {
  if (error.response?.status === 401) {
    return handleAuthFetch(state);
  } else {
    return state;
  }
};

const instance = (state = initialState, action: AnyAction | InstanceAction | PreloadAction): Instance => {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return preloadImport(state, action, '/api/v1/instance');
    case INSTANCE_FETCH_SUCCESS:
      persistInstance(action.instance);
      return action.instance;
    case INSTANCE_FETCH_FAIL:
      return handleInstanceFetchFail(state, action.error);
    case ADMIN_CONFIG_UPDATE_REQUEST:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return importConfigs(state, ImmutableList(fromJS(action.configs)));
    default:
      return state;
  }
};

export { instance as default };

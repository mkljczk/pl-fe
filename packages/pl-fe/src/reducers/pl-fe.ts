import { List as ImmutableList, Map as ImmutableMap, fromJS } from 'immutable';

import { PLEROMA_PRELOAD_IMPORT } from 'pl-fe/actions/preload';
import KVStore from 'pl-fe/storage/kv-store';
import ConfigDB from 'pl-fe/utils/config-db';

import { ADMIN_CONFIG_UPDATE_SUCCESS } from '../actions/admin';
import {
  PLFE_CONFIG_REMEMBER_SUCCESS,
  PLFE_CONFIG_REQUEST_SUCCESS,
  PLFE_CONFIG_REQUEST_FAIL,
} from '../actions/pl-fe';

const initialState = ImmutableMap<string, any>();

const fallbackState = ImmutableMap<string, any>({
  brandColor: '#d80482',
});

const updateFromAdmin = (state: ImmutableMap<string, any>, configs: ImmutableList<ImmutableMap<string, any>>) => {
  try {
    return ConfigDB.find(configs, ':pleroma', ':frontend_configurations')!
      .get('value')
      .find((value: ImmutableMap<string, any>) => value.getIn(['tuple', 0]) === ':pl_fe')
      .getIn(['tuple', 1]);
  } catch {
    return state;
  }
};

const preloadImport = (state: ImmutableMap<string, any>, action: Record<string, any>) => {
  const path = '/api/pleroma/frontend_configurations';
  const feData = action.data[path];

  if (feData) {
    const plfe = feData.pl_fe;
    return plfe ? fallbackState.mergeDeep(fromJS(plfe)) : fallbackState;
  } else {
    return state;
  }
};

const persistPlFeConfig = (plFeConfig: ImmutableMap<string, any>, host: string) => {
  if (host) {
    KVStore.setItem(`plfe_config:${host}`, plFeConfig.toJS()).catch(console.error);
  }
};

const importPlFeConfig = (state: ImmutableMap<string, any>, plFeConfig: ImmutableMap<string, any>, host: string) => {
  persistPlFeConfig(plFeConfig, host);
  return plFeConfig;
};

const plfe = (state = initialState, action: Record<string, any>) => {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return preloadImport(state, action);
    case PLFE_CONFIG_REMEMBER_SUCCESS:
      return fromJS(action.plFeConfig);
    case PLFE_CONFIG_REQUEST_SUCCESS:
      return importPlFeConfig(state, fromJS(action.plFeConfig) as ImmutableMap<string, any>, action.host);
    case PLFE_CONFIG_REQUEST_FAIL:
      return fallbackState.mergeDeep(state);
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return updateFromAdmin(state, fromJS(action.configs) as ImmutableList<ImmutableMap<string, any>>);
    default:
      return state;
  }
};

export { plfe as default };

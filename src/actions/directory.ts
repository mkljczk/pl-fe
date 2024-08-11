import { getClient } from '../api';

import { fetchRelationships } from './accounts';
import { importFetchedAccounts } from './importer';

import type { Account, ProfileDirectoryParams } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';

const DIRECTORY_FETCH_REQUEST = 'DIRECTORY_FETCH_REQUEST' as const;
const DIRECTORY_FETCH_SUCCESS = 'DIRECTORY_FETCH_SUCCESS' as const;
const DIRECTORY_FETCH_FAIL = 'DIRECTORY_FETCH_FAIL' as const;

const DIRECTORY_EXPAND_REQUEST = 'DIRECTORY_EXPAND_REQUEST' as const;
const DIRECTORY_EXPAND_SUCCESS = 'DIRECTORY_EXPAND_SUCCESS' as const;
const DIRECTORY_EXPAND_FAIL = 'DIRECTORY_EXPAND_FAIL' as const;

const fetchDirectory = (params: ProfileDirectoryParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchDirectoryRequest());

    return getClient(getState()).instance.profileDirectory({ ...params, limit: 20 }).then((data) => {
      dispatch(importFetchedAccounts(data));
      dispatch(fetchDirectorySuccess(data));
      dispatch(fetchRelationships(data.map((x) => x.id)));
    }).catch(error => dispatch(fetchDirectoryFail(error)));
  };

const fetchDirectoryRequest = () => ({
  type: DIRECTORY_FETCH_REQUEST,
});

const fetchDirectorySuccess = (accounts: Array<Account>) => ({
  type: DIRECTORY_FETCH_SUCCESS,
  accounts,
});

const fetchDirectoryFail = (error: unknown) => ({
  type: DIRECTORY_FETCH_FAIL,
  error,
});

const expandDirectory = (params: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(expandDirectoryRequest());

    const loadedItems = getState().user_lists.directory.items.size;

    return getClient(getState()).instance.profileDirectory({ ...params, offset: loadedItems, limit: 20 }).then((data) => {
      dispatch(importFetchedAccounts(data));
      dispatch(expandDirectorySuccess(data));
      dispatch(fetchRelationships(data.map((x) => x.id)));
    }).catch(error => dispatch(expandDirectoryFail(error)));
  };

const expandDirectoryRequest = () => ({
  type: DIRECTORY_EXPAND_REQUEST,
});

const expandDirectorySuccess = (accounts: Array<Account>) => ({
  type: DIRECTORY_EXPAND_SUCCESS,
  accounts,
});

const expandDirectoryFail = (error: unknown) => ({
  type: DIRECTORY_EXPAND_FAIL,
  error,
});

export {
  DIRECTORY_FETCH_REQUEST,
  DIRECTORY_FETCH_SUCCESS,
  DIRECTORY_FETCH_FAIL,
  DIRECTORY_EXPAND_REQUEST,
  DIRECTORY_EXPAND_SUCCESS,
  DIRECTORY_EXPAND_FAIL,
  fetchDirectory,
  fetchDirectoryRequest,
  fetchDirectorySuccess,
  fetchDirectoryFail,
  expandDirectory,
  expandDirectoryRequest,
  expandDirectorySuccess,
  expandDirectoryFail,
};
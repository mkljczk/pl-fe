import { getClient } from '../api';

import { fetchRelationships } from './accounts';
import { importFetchedAccounts, importFetchedStatuses } from './importer';

import type { Search } from 'pl-api';
import type { SearchFilter } from 'soapbox/reducers/search';
import type { AppDispatch, RootState } from 'soapbox/store';

const SEARCH_CHANGE = 'SEARCH_CHANGE' as const;
const SEARCH_CLEAR = 'SEARCH_CLEAR' as const;
const SEARCH_SHOW = 'SEARCH_SHOW' as const;
const SEARCH_RESULTS_CLEAR = 'SEARCH_RESULTS_CLEAR' as const;

const SEARCH_FETCH_REQUEST = 'SEARCH_FETCH_REQUEST' as const;
const SEARCH_FETCH_SUCCESS = 'SEARCH_FETCH_SUCCESS' as const;
const SEARCH_FETCH_FAIL = 'SEARCH_FETCH_FAIL' as const;

const SEARCH_FILTER_SET = 'SEARCH_FILTER_SET' as const;

const SEARCH_EXPAND_REQUEST = 'SEARCH_EXPAND_REQUEST' as const;
const SEARCH_EXPAND_SUCCESS = 'SEARCH_EXPAND_SUCCESS' as const;
const SEARCH_EXPAND_FAIL = 'SEARCH_EXPAND_FAIL' as const;

const SEARCH_ACCOUNT_SET = 'SEARCH_ACCOUNT_SET' as const;

const changeSearch = (value: string) =>
  (dispatch: AppDispatch) => {
    // If backspaced all the way, clear the search
    if (value.length === 0) {
      dispatch(clearSearchResults());
      return dispatch({
        type: SEARCH_CHANGE,
        value,
      });
    } else {
      return dispatch({
        type: SEARCH_CHANGE,
        value,
      });
    }
  };

const clearSearch = () => ({
  type: SEARCH_CLEAR,
});

const clearSearchResults = () => ({
  type: SEARCH_RESULTS_CLEAR,
});

const submitSearch = (filter?: SearchFilter) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const value = getState().search.value;
    const type = filter || getState().search.filter || 'accounts';
    const accountId = getState().search.accountId;

    // An empty search doesn't return any results
    if (value.length === 0) {
      return;
    }

    dispatch(fetchSearchRequest(value));

    const params: Record<string, any> = {
      resolve: true,
      limit: 20,
      type: type as any,
    };

    if (accountId) params.account_id = accountId;

    return getClient(getState()).search.search(value, params).then(response => {
      if (response.accounts) {
        dispatch(importFetchedAccounts(response.accounts));
      }

      if (response.statuses) {
        dispatch(importFetchedStatuses(response.statuses));
      }

      dispatch(fetchSearchSuccess(response, value, type));
      dispatch(fetchRelationships(response.accounts.map((item) => item.id)));
    }).catch(error => {
      dispatch(fetchSearchFail(error));
    });
  };

const fetchSearchRequest = (value: string) => ({
  type: SEARCH_FETCH_REQUEST,
  value,
});

const fetchSearchSuccess = (results: Search, searchTerm: string, searchType: SearchFilter) => ({
  type: SEARCH_FETCH_SUCCESS,
  results,
  searchTerm,
  searchType,
});

const fetchSearchFail = (error: unknown) => ({
  type: SEARCH_FETCH_FAIL,
  error,
});

const setFilter = (filterType: SearchFilter) =>
  (dispatch: AppDispatch) => {
    dispatch(submitSearch(filterType));

    dispatch({
      type: SEARCH_FILTER_SET,
      path: ['search', 'filter'],
      value: filterType,
    });
  };

const expandSearch = (type: SearchFilter) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (type === 'links') return;
  const value = getState().search.value;
  const offset = getState().search.results[type].size;
  const accountId = getState().search.accountId;

  dispatch(expandSearchRequest(type));

  const params: Record<string, any> = {
    type,
    offset,
  };
  if (accountId) params.account_id = accountId;

  return getClient(getState()).search.search(value, params).then(response => {
    if (response.accounts) {
      dispatch(importFetchedAccounts(response.accounts));
    }

    if (response.statuses) {
      dispatch(importFetchedStatuses(response.statuses));
    }

    dispatch(expandSearchSuccess(response, value, type));
    dispatch(fetchRelationships(response.accounts.map((item) => item.id)));
  }).catch(error => {
    dispatch(expandSearchFail(error));
  });
};

const expandSearchRequest = (searchType: SearchFilter) => ({
  type: SEARCH_EXPAND_REQUEST,
  searchType,
});

const expandSearchSuccess = (results: Search, searchTerm: string, searchType: SearchFilter) => ({
  type: SEARCH_EXPAND_SUCCESS,
  results,
  searchTerm,
  searchType,
});

const expandSearchFail = (error: unknown) => ({
  type: SEARCH_EXPAND_FAIL,
  error,
});

const showSearch = () => ({
  type: SEARCH_SHOW,
});

const setSearchAccount = (accountId: string | null) => ({
  type: SEARCH_ACCOUNT_SET,
  accountId,
});

export {
  SEARCH_CHANGE,
  SEARCH_CLEAR,
  SEARCH_SHOW,
  SEARCH_RESULTS_CLEAR,
  SEARCH_FETCH_REQUEST,
  SEARCH_FETCH_SUCCESS,
  SEARCH_FETCH_FAIL,
  SEARCH_FILTER_SET,
  SEARCH_EXPAND_REQUEST,
  SEARCH_EXPAND_SUCCESS,
  SEARCH_EXPAND_FAIL,
  SEARCH_ACCOUNT_SET,
  changeSearch,
  clearSearch,
  clearSearchResults,
  submitSearch,
  fetchSearchRequest,
  fetchSearchSuccess,
  fetchSearchFail,
  setFilter,
  expandSearch,
  expandSearchRequest,
  expandSearchSuccess,
  expandSearchFail,
  showSearch,
  setSearchAccount,
};

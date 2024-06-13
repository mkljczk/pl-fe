import { isLoggedIn } from 'soapbox/utils/auth';

import api, { getNextLink } from '../api';

import { importFetchedStatuses } from './importer';

import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const FAVOURITED_STATUSES_FETCH_REQUEST = 'FAVOURITED_STATUSES_FETCH_REQUEST';
const FAVOURITED_STATUSES_FETCH_SUCCESS = 'FAVOURITED_STATUSES_FETCH_SUCCESS';
const FAVOURITED_STATUSES_FETCH_FAIL    = 'FAVOURITED_STATUSES_FETCH_FAIL';

const FAVOURITED_STATUSES_EXPAND_REQUEST = 'FAVOURITED_STATUSES_EXPAND_REQUEST';
const FAVOURITED_STATUSES_EXPAND_SUCCESS = 'FAVOURITED_STATUSES_EXPAND_SUCCESS';
const FAVOURITED_STATUSES_EXPAND_FAIL    = 'FAVOURITED_STATUSES_EXPAND_FAIL';

const ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST = 'ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST';
const ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS = 'ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS';
const ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL    = 'ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL';

const ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST = 'ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST';
const ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS = 'ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS';
const ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL    = 'ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL';

const fetchFavouritedStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    if (getState().status_lists.get('favourites')?.isLoading) {
      return;
    }

    dispatch(fetchFavouritedStatusesRequest());

    api(getState)('/api/v1/favourites').then(response => {
      const next = getNextLink(response);
      dispatch(importFetchedStatuses(response.json));
      dispatch(fetchFavouritedStatusesSuccess(response.json, next || null));
    }).catch(error => {
      dispatch(fetchFavouritedStatusesFail(error));
    });
  };

const fetchFavouritedStatusesRequest = () => ({
  type: FAVOURITED_STATUSES_FETCH_REQUEST,
  skipLoading: true,
});

const fetchFavouritedStatusesSuccess = (statuses: APIEntity[], next: string | null) => ({
  type: FAVOURITED_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
  skipLoading: true,
});

const fetchFavouritedStatusesFail = (error: unknown) => ({
  type: FAVOURITED_STATUSES_FETCH_FAIL,
  error,
  skipLoading: true,
});

const expandFavouritedStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const url = getState().status_lists.get('favourites')?.next || null;

    if (url === null || getState().status_lists.get('favourites')?.isLoading) {
      return;
    }

    dispatch(expandFavouritedStatusesRequest());

    api(getState)(url).then(response => {
      const next = getNextLink(response);
      dispatch(importFetchedStatuses(response.json));
      dispatch(expandFavouritedStatusesSuccess(response.json, next || null));
    }).catch(error => {
      dispatch(expandFavouritedStatusesFail(error));
    });
  };

const expandFavouritedStatusesRequest = () => ({
  type: FAVOURITED_STATUSES_EXPAND_REQUEST,
});

const expandFavouritedStatusesSuccess = (statuses: APIEntity[], next: string | null) => ({
  type: FAVOURITED_STATUSES_EXPAND_SUCCESS,
  statuses,
  next,
});

const expandFavouritedStatusesFail = (error: unknown) => ({
  type: FAVOURITED_STATUSES_EXPAND_FAIL,
  error,
});

const fetchAccountFavouritedStatuses = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    if (getState().status_lists.get(`favourites:${accountId}`)?.isLoading) {
      return;
    }

    dispatch(fetchAccountFavouritedStatusesRequest(accountId));

    api(getState)(`/api/v1/pleroma/accounts/${accountId}/favourites`).then(response => {
      const next = getNextLink(response);
      dispatch(importFetchedStatuses(response.json));
      dispatch(fetchAccountFavouritedStatusesSuccess(accountId, response.json, next || null));
    }).catch(error => {
      dispatch(fetchAccountFavouritedStatusesFail(accountId, error));
    });
  };

const fetchAccountFavouritedStatusesRequest = (accountId: string) => ({
  type: ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST,
  accountId,
  skipLoading: true,
});

const fetchAccountFavouritedStatusesSuccess = (accountId: string, statuses: APIEntity, next: string | null) => ({
  type: ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS,
  accountId,
  statuses,
  next,
  skipLoading: true,
});

const fetchAccountFavouritedStatusesFail = (accountId: string, error: unknown) => ({
  type: ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL,
  accountId,
  error,
  skipLoading: true,
});

const expandAccountFavouritedStatuses = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const url = getState().status_lists.get(`favourites:${accountId}`)?.next || null;

    if (url === null || getState().status_lists.get(`favourites:${accountId}`)?.isLoading) {
      return;
    }

    dispatch(expandAccountFavouritedStatusesRequest(accountId));

    api(getState)(url).then(response => {
      const next = getNextLink(response);
      dispatch(importFetchedStatuses(response.json));
      dispatch(expandAccountFavouritedStatusesSuccess(accountId, response.json, next || null));
    }).catch(error => {
      dispatch(expandAccountFavouritedStatusesFail(accountId, error));
    });
  };

const expandAccountFavouritedStatusesRequest = (accountId: string) => ({
  type: ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST,
  accountId,
});

const expandAccountFavouritedStatusesSuccess = (accountId: string, statuses: APIEntity[], next: string | null) => ({
  type: ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS,
  accountId,
  statuses,
  next,
});

const expandAccountFavouritedStatusesFail = (accountId: string, error: unknown) => ({
  type: ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL,
  accountId,
  error,
});

export {
  FAVOURITED_STATUSES_FETCH_REQUEST,
  FAVOURITED_STATUSES_FETCH_SUCCESS,
  FAVOURITED_STATUSES_FETCH_FAIL,
  FAVOURITED_STATUSES_EXPAND_REQUEST,
  FAVOURITED_STATUSES_EXPAND_SUCCESS,
  FAVOURITED_STATUSES_EXPAND_FAIL,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL,
  fetchFavouritedStatuses,
  fetchFavouritedStatusesRequest,
  fetchFavouritedStatusesSuccess,
  fetchFavouritedStatusesFail,
  expandFavouritedStatuses,
  expandFavouritedStatusesRequest,
  expandFavouritedStatusesSuccess,
  expandFavouritedStatusesFail,
  fetchAccountFavouritedStatuses,
  fetchAccountFavouritedStatusesRequest,
  fetchAccountFavouritedStatusesSuccess,
  fetchAccountFavouritedStatusesFail,
  expandAccountFavouritedStatuses,
  expandAccountFavouritedStatusesRequest,
  expandAccountFavouritedStatusesSuccess,
  expandAccountFavouritedStatusesFail,
};

import { isLoggedIn } from 'soapbox/utils/auth';

import { getClient } from '../api';

import { importFetchedStatuses } from './importer';

import type { PaginatedResponse, Status } from 'pl-api';
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

    return getClient(getState()).myAccount.getFavourites().then(response => {
      dispatch(importFetchedStatuses(response.items));
      dispatch(fetchFavouritedStatusesSuccess(response.items, response.next));
    }).catch(error => {
      dispatch(fetchFavouritedStatusesFail(error));
    });
  };

const fetchFavouritedStatusesRequest = () => ({
  type: FAVOURITED_STATUSES_FETCH_REQUEST,
  skipLoading: true,
});

const fetchFavouritedStatusesSuccess = (statuses: APIEntity[], next: (() => Promise<PaginatedResponse<Status>>) | null) => ({
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

    const next = getState().status_lists.get('favourites')?.next || null;

    if (next === null || getState().status_lists.get('favourites')?.isLoading) {
      return;
    }

    dispatch(expandFavouritedStatusesRequest());

    return next().then(response => {
      dispatch(importFetchedStatuses(response.items));
      dispatch(expandFavouritedStatusesSuccess(response.items, response.next));
    }).catch(error => {
      dispatch(expandFavouritedStatusesFail(error));
    });
  };

const expandFavouritedStatusesRequest = () => ({
  type: FAVOURITED_STATUSES_EXPAND_REQUEST,
});

const expandFavouritedStatusesSuccess = (statuses: APIEntity[], next: (() => Promise<PaginatedResponse<Status>>) | null) => ({
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

    return getClient(getState).accounts.getAccountFavourites(accountId).then(response => {
      dispatch(importFetchedStatuses(response.items));
      dispatch(fetchAccountFavouritedStatusesSuccess(accountId, response.items, response.next));
    }).catch(error => {
      dispatch(fetchAccountFavouritedStatusesFail(accountId, error));
    });
  };

const fetchAccountFavouritedStatusesRequest = (accountId: string) => ({
  type: ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST,
  accountId,
  skipLoading: true,
});

const fetchAccountFavouritedStatusesSuccess = (accountId: string, statuses: APIEntity, next: (() => Promise<PaginatedResponse<Status>>) | null) => ({
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

    const next = getState().status_lists.get(`favourites:${accountId}`)?.next || null;

    if (next === null || getState().status_lists.get(`favourites:${accountId}`)?.isLoading) {
      return;
    }

    dispatch(expandAccountFavouritedStatusesRequest(accountId));

    return next().then(response => {
      dispatch(importFetchedStatuses(response.items));
      dispatch(expandAccountFavouritedStatusesSuccess(accountId, response.items, response.next));
    }).catch(error => {
      dispatch(expandAccountFavouritedStatusesFail(accountId, error));
    });
  };

const expandAccountFavouritedStatusesRequest = (accountId: string) => ({
  type: ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST,
  accountId,
});

const expandAccountFavouritedStatusesSuccess = (accountId: string, statuses: APIEntity[], next: (() => Promise<PaginatedResponse<Status>>) | null) => ({
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

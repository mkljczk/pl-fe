import { getClient } from '../api';

import { importFetchedStatuses } from './importer';

import type { PaginatedResponse, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const BOOKMARKED_STATUSES_FETCH_REQUEST = 'BOOKMARKED_STATUSES_FETCH_REQUEST';
const BOOKMARKED_STATUSES_FETCH_SUCCESS = 'BOOKMARKED_STATUSES_FETCH_SUCCESS';
const BOOKMARKED_STATUSES_FETCH_FAIL    = 'BOOKMARKED_STATUSES_FETCH_FAIL';

const BOOKMARKED_STATUSES_EXPAND_REQUEST = 'BOOKMARKED_STATUSES_EXPAND_REQUEST';
const BOOKMARKED_STATUSES_EXPAND_SUCCESS = 'BOOKMARKED_STATUSES_EXPAND_SUCCESS';
const BOOKMARKED_STATUSES_EXPAND_FAIL    = 'BOOKMARKED_STATUSES_EXPAND_FAIL';

const noOp = () => new Promise(f => f(undefined));

const fetchBookmarkedStatuses = (folderId?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.get(folderId ? `bookmarks:${folderId}` : 'bookmarks')?.isLoading) {
      return dispatch(noOp);
    }

    dispatch(fetchBookmarkedStatusesRequest(folderId));

    return getClient(getState()).myAccount.getBookmarks({ folder_id: folderId }).then(response => {
      dispatch(importFetchedStatuses(response.items));
      return dispatch(fetchBookmarkedStatusesSuccess(response.items, response.next, folderId));
    }).catch(error => {
      dispatch(fetchBookmarkedStatusesFail(error, folderId));
    });
  };

const fetchBookmarkedStatusesRequest = (folderId?: string) => ({
  type: BOOKMARKED_STATUSES_FETCH_REQUEST,
  folderId,
});

const fetchBookmarkedStatusesSuccess = (statuses: APIEntity[], next: (() => Promise<PaginatedResponse<Status>>) | null, folderId?: string) => ({
  type: BOOKMARKED_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
  folderId,
});

const fetchBookmarkedStatusesFail = (error: unknown, folderId?: string) => ({
  type: BOOKMARKED_STATUSES_FETCH_FAIL,
  error,
  folderId,
});

const expandBookmarkedStatuses = (folderId?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const list = folderId ? `bookmarks:${folderId}` : 'bookmarks';
    const next = getState().status_lists.get(list)?.next || null;

    if (next === null || getState().status_lists.get(list)?.isLoading) {
      return dispatch(noOp);
    }

    dispatch(expandBookmarkedStatusesRequest(folderId));

    return next().then(response => {
      dispatch(importFetchedStatuses(response.items));
      return dispatch(expandBookmarkedStatusesSuccess(response.items, response.next, folderId));
    }).catch(error => {
      dispatch(expandBookmarkedStatusesFail(error, folderId));
    });
  };

const expandBookmarkedStatusesRequest = (folderId?: string) => ({
  type: BOOKMARKED_STATUSES_EXPAND_REQUEST,
  folderId,
});

const expandBookmarkedStatusesSuccess = (statuses: APIEntity[], next: (() => Promise<PaginatedResponse<Status>>) | null, folderId?: string) => ({
  type: BOOKMARKED_STATUSES_EXPAND_SUCCESS,
  statuses,
  next,
  folderId,
});

const expandBookmarkedStatusesFail = (error: unknown, folderId?: string) => ({
  type: BOOKMARKED_STATUSES_EXPAND_FAIL,
  error,
  folderId,
});

export {
  BOOKMARKED_STATUSES_FETCH_REQUEST,
  BOOKMARKED_STATUSES_FETCH_SUCCESS,
  BOOKMARKED_STATUSES_FETCH_FAIL,
  BOOKMARKED_STATUSES_EXPAND_REQUEST,
  BOOKMARKED_STATUSES_EXPAND_SUCCESS,
  BOOKMARKED_STATUSES_EXPAND_FAIL,
  fetchBookmarkedStatuses,
  fetchBookmarkedStatusesRequest,
  fetchBookmarkedStatusesSuccess,
  fetchBookmarkedStatusesFail,
  expandBookmarkedStatuses,
  expandBookmarkedStatusesRequest,
  expandBookmarkedStatusesSuccess,
  expandBookmarkedStatusesFail,
};

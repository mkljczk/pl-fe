import { isLoggedIn } from 'soapbox/utils/auth';

import { getClient } from '../api';

import { importFetchedStatuses } from './importer';

import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const PINNED_STATUSES_FETCH_REQUEST = 'PINNED_STATUSES_FETCH_REQUEST';
const PINNED_STATUSES_FETCH_SUCCESS = 'PINNED_STATUSES_FETCH_SUCCESS';
const PINNED_STATUSES_FETCH_FAIL = 'PINNED_STATUSES_FETCH_FAIL';

const fetchPinnedStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;
    const me = getState().me;

    dispatch(fetchPinnedStatusesRequest());

    return getClient(getState()).accounts.getAccountStatuses(me as string, { pinned: true }).then(response => {
      dispatch(importFetchedStatuses(response.items));
      dispatch(fetchPinnedStatusesSuccess(response.items, null));
    }).catch(error => {
      dispatch(fetchPinnedStatusesFail(error));
    });
  };

const fetchPinnedStatusesRequest = () => ({
  type: PINNED_STATUSES_FETCH_REQUEST,
});

const fetchPinnedStatusesSuccess = (statuses: APIEntity[], next: string | null) => ({
  type: PINNED_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
});

const fetchPinnedStatusesFail = (error: unknown) => ({
  type: PINNED_STATUSES_FETCH_FAIL,
  error,
});

export {
  PINNED_STATUSES_FETCH_REQUEST,
  PINNED_STATUSES_FETCH_SUCCESS,
  PINNED_STATUSES_FETCH_FAIL,
  fetchPinnedStatuses,
  fetchPinnedStatusesRequest,
  fetchPinnedStatusesSuccess,
  fetchPinnedStatusesFail,
};

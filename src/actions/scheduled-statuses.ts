import { getFeatures } from 'soapbox/utils/features';

import { getClient } from '../api';

import type { PaginatedResponse, ScheduledStatus } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const SCHEDULED_STATUSES_FETCH_REQUEST = 'SCHEDULED_STATUSES_FETCH_REQUEST';
const SCHEDULED_STATUSES_FETCH_SUCCESS = 'SCHEDULED_STATUSES_FETCH_SUCCESS';
const SCHEDULED_STATUSES_FETCH_FAIL    = 'SCHEDULED_STATUSES_FETCH_FAIL';

const SCHEDULED_STATUSES_EXPAND_REQUEST = 'SCHEDULED_STATUSES_EXPAND_REQUEST';
const SCHEDULED_STATUSES_EXPAND_SUCCESS = 'SCHEDULED_STATUSES_EXPAND_SUCCESS';
const SCHEDULED_STATUSES_EXPAND_FAIL    = 'SCHEDULED_STATUSES_EXPAND_FAIL';

const SCHEDULED_STATUS_CANCEL_REQUEST = 'SCHEDULED_STATUS_CANCEL_REQUEST';
const SCHEDULED_STATUS_CANCEL_SUCCESS = 'SCHEDULED_STATUS_CANCEL_SUCCESS';
const SCHEDULED_STATUS_CANCEL_FAIL    = 'SCHEDULED_STATUS_CANCEL_FAIL';

const fetchScheduledStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    if (state.status_lists.get('scheduled_statuses')?.isLoading) {
      return;
    }

    const instance = state.instance;
    const features = getFeatures(instance);

    if (!features.scheduledStatuses) return;

    dispatch(fetchScheduledStatusesRequest());

    return getClient(getState()).scheduledStatuses.getScheduledStatuses().then(({ next, items }) => {
      dispatch(fetchScheduledStatusesSuccess(items, next));
    }).catch(error => {
      dispatch(fetchScheduledStatusesFail(error));
    });
  };

const cancelScheduledStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: SCHEDULED_STATUS_CANCEL_REQUEST, id });
    return getClient(getState()).scheduledStatuses.cancelScheduledStatus(id).then((data) => {
      dispatch({ type: SCHEDULED_STATUS_CANCEL_SUCCESS, id, data });
    }).catch(error => {
      dispatch({ type: SCHEDULED_STATUS_CANCEL_FAIL, id, error });
    });
  };

const fetchScheduledStatusesRequest = () => ({
  type: SCHEDULED_STATUSES_FETCH_REQUEST,
});

const fetchScheduledStatusesSuccess = (statuses: APIEntity[], next: (() => Promise<PaginatedResponse<ScheduledStatus>>) | null) => ({
  type: SCHEDULED_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
});

const fetchScheduledStatusesFail = (error: unknown) => ({
  type: SCHEDULED_STATUSES_FETCH_FAIL,
  error,
});

const expandScheduledStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const next = getState().status_lists.get('scheduled_statuses')?.next as any as () => Promise<PaginatedResponse<ScheduledStatus>> || null;

    if (next === null || getState().status_lists.get('scheduled_statuses')?.isLoading) {
      return;
    }

    dispatch(expandScheduledStatusesRequest());

    next().then(response => {
      dispatch(expandScheduledStatusesSuccess(response.items, response.next));
    }).catch(error => {
      dispatch(expandScheduledStatusesFail(error));
    });
  };

const expandScheduledStatusesRequest = () => ({
  type: SCHEDULED_STATUSES_EXPAND_REQUEST,
});

const expandScheduledStatusesSuccess = (statuses: APIEntity[], next: (() => Promise<PaginatedResponse<ScheduledStatus>>) | null) => ({
  type: SCHEDULED_STATUSES_EXPAND_SUCCESS,
  statuses,
  next,
});

const expandScheduledStatusesFail = (error: unknown) => ({
  type: SCHEDULED_STATUSES_EXPAND_FAIL,
  error,
});

export {
  SCHEDULED_STATUSES_FETCH_REQUEST,
  SCHEDULED_STATUSES_FETCH_SUCCESS,
  SCHEDULED_STATUSES_FETCH_FAIL,
  SCHEDULED_STATUSES_EXPAND_REQUEST,
  SCHEDULED_STATUSES_EXPAND_SUCCESS,
  SCHEDULED_STATUSES_EXPAND_FAIL,
  SCHEDULED_STATUS_CANCEL_REQUEST,
  SCHEDULED_STATUS_CANCEL_SUCCESS,
  SCHEDULED_STATUS_CANCEL_FAIL,
  fetchScheduledStatuses,
  cancelScheduledStatus,
  fetchScheduledStatusesRequest,
  fetchScheduledStatusesSuccess,
  fetchScheduledStatusesFail,
  expandScheduledStatuses,
  expandScheduledStatusesRequest,
  expandScheduledStatusesSuccess,
  expandScheduledStatusesFail,
};

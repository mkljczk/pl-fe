import { getClient } from '../api';

import { importFetchedStatuses } from './importer';

import type { AppDispatch, RootState } from 'soapbox/store';

const STATUS_QUOTES_FETCH_REQUEST = 'STATUS_QUOTES_FETCH_REQUEST';
const STATUS_QUOTES_FETCH_SUCCESS = 'STATUS_QUOTES_FETCH_SUCCESS';
const STATUS_QUOTES_FETCH_FAIL    = 'STATUS_QUOTES_FETCH_FAIL';

const STATUS_QUOTES_EXPAND_REQUEST = 'STATUS_QUOTES_EXPAND_REQUEST';
const STATUS_QUOTES_EXPAND_SUCCESS = 'STATUS_QUOTES_EXPAND_SUCCESS';
const STATUS_QUOTES_EXPAND_FAIL    = 'STATUS_QUOTES_EXPAND_FAIL';

const noOp = () => new Promise(f => f(null));

const fetchStatusQuotes = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.getIn([`quotes:${statusId}`, 'isLoading'])) {
      return dispatch(noOp);
    }

    dispatch({
      statusId,
      type: STATUS_QUOTES_FETCH_REQUEST,
    });

    return getClient(getState).statuses.getStatusQuotes(statusId).then(response => {
      dispatch(importFetchedStatuses(response.items));
      return dispatch({
        type: STATUS_QUOTES_FETCH_SUCCESS,
        statusId,
        statuses: response.items,
        next: response.next,
      });
    }).catch(error => {
      dispatch({
        type: STATUS_QUOTES_FETCH_FAIL,
        statusId,
        error,
      });
    });
  };

const expandStatusQuotes = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const next = getState().status_lists.get(`quotes:${statusId}`)?.next || null;

    if (next === null || getState().status_lists.getIn([`quotes:${statusId}`, 'isLoading'])) {
      return dispatch(noOp);
    }

    dispatch({
      type: STATUS_QUOTES_EXPAND_REQUEST,
      statusId,
    });

    return next().then(response => {
      dispatch(importFetchedStatuses(response.items));
      dispatch({
        type: STATUS_QUOTES_EXPAND_SUCCESS,
        statusId,
        statuses: response.items,
        next: response.next,
      });
    }).catch(error => {
      dispatch({
        type: STATUS_QUOTES_EXPAND_FAIL,
        statusId,
        error,
      });
    });
  };

export {
  STATUS_QUOTES_FETCH_REQUEST,
  STATUS_QUOTES_FETCH_SUCCESS,
  STATUS_QUOTES_FETCH_FAIL,
  STATUS_QUOTES_EXPAND_REQUEST,
  STATUS_QUOTES_EXPAND_SUCCESS,
  STATUS_QUOTES_EXPAND_FAIL,
  fetchStatusQuotes,
  expandStatusQuotes,
};

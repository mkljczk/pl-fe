import api, { getNextLink } from '../api';

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

    return api(getState)(`/api/v1/pleroma/statuses/${statusId}/quotes`).then(response => {
      const next = getNextLink(response);
      dispatch(importFetchedStatuses(response.json));
      return dispatch({
        type: STATUS_QUOTES_FETCH_SUCCESS,
        statusId,
        statuses: response.json,
        next: next || null,
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
    const url = getState().status_lists.getIn([`quotes:${statusId}`, 'next'], null) as string | null;

    if (url === null || getState().status_lists.getIn([`quotes:${statusId}`, 'isLoading'])) {
      return dispatch(noOp);
    }

    dispatch({
      type: STATUS_QUOTES_EXPAND_REQUEST,
      statusId,
    });

    return api(getState)(url).then(response => {
      const next = getNextLink(response);
      dispatch(importFetchedStatuses(response.json));
      dispatch({
        type: STATUS_QUOTES_EXPAND_SUCCESS,
        statusId,
        statuses: response.json,
        next: next || null,
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

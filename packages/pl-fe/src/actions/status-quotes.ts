import { importEntities } from 'pl-hooks/importer';

import { getClient } from 'pl-fe/api';

import type { Status as BaseStatus, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const STATUS_QUOTES_FETCH_REQUEST = 'STATUS_QUOTES_FETCH_REQUEST' as const;
const STATUS_QUOTES_FETCH_SUCCESS = 'STATUS_QUOTES_FETCH_SUCCESS' as const;
const STATUS_QUOTES_FETCH_FAIL = 'STATUS_QUOTES_FETCH_FAIL' as const;

const STATUS_QUOTES_EXPAND_REQUEST = 'STATUS_QUOTES_EXPAND_REQUEST' as const;
const STATUS_QUOTES_EXPAND_SUCCESS = 'STATUS_QUOTES_EXPAND_SUCCESS' as const;
const STATUS_QUOTES_EXPAND_FAIL = 'STATUS_QUOTES_EXPAND_FAIL' as const;

const noOp = () => new Promise(f => f(null));

interface FetchStatusQuotesRequestAction {
  type: typeof STATUS_QUOTES_FETCH_REQUEST;
  statusId: string;
}

interface FetchStatusQuotesSuccessAction {
  type: typeof STATUS_QUOTES_FETCH_SUCCESS;
  statusId: string;
  statuses: Array<BaseStatus>;
  next: (() => Promise<PaginatedResponse<BaseStatus>>) | null;
}

interface FetchStatusQuotesFailAction {
  type: typeof STATUS_QUOTES_FETCH_FAIL;
  statusId: string;
  error: unknown;
}

const fetchStatusQuotes = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.getIn([`quotes:${statusId}`, 'isLoading'])) {
      return dispatch(noOp);
    }

    const action: FetchStatusQuotesRequestAction = { type: STATUS_QUOTES_FETCH_REQUEST, statusId };
    dispatch(action);

    return getClient(getState).statuses.getStatusQuotes(statusId).then(response => {
      importEntities({ statuses: response.items });
      const action: FetchStatusQuotesSuccessAction = {
        type: STATUS_QUOTES_FETCH_SUCCESS,
        statusId,
        statuses: response.items,
        next: response.next,
      };
      return dispatch(action);
    }).catch(error => {
      const action: FetchStatusQuotesFailAction = {
        type: STATUS_QUOTES_FETCH_FAIL,
        statusId,
        error,
      };
      dispatch(action);
    });
  };

interface ExpandStatusQuotesRequestAction {
  type: typeof STATUS_QUOTES_EXPAND_REQUEST;
  statusId: string;
}

interface ExpandStatusQuotesSuccessAction {
  type: typeof STATUS_QUOTES_EXPAND_SUCCESS;
  statusId: string;
  statuses: Array<BaseStatus>;
  next: (() => Promise<PaginatedResponse<BaseStatus>>) | null;
}

interface ExpandStatusQuotesFailAction {
  type: typeof STATUS_QUOTES_EXPAND_FAIL;
  statusId: string;
  error: unknown;
}

const expandStatusQuotes = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const next = getState().status_lists.get(`quotes:${statusId}`)?.next || null;

    if (next === null || getState().status_lists.getIn([`quotes:${statusId}`, 'isLoading'])) {
      return dispatch(noOp);
    }

    const action: ExpandStatusQuotesRequestAction = {
      type: STATUS_QUOTES_EXPAND_REQUEST,
      statusId,
    };
    dispatch(action);

    return next().then(response => {
      importEntities({ statuses: response.items });
      const action: ExpandStatusQuotesSuccessAction = {
        type: STATUS_QUOTES_EXPAND_SUCCESS,
        statusId,
        statuses: response.items,
        next: response.next,
      };
      dispatch(action);
    }).catch(error => {
      const action: ExpandStatusQuotesFailAction = {
        type: STATUS_QUOTES_EXPAND_FAIL,
        statusId,
        error,
      };
      dispatch(action);
    });
  };

type StatusQuotesAction =
  | FetchStatusQuotesRequestAction
  | FetchStatusQuotesSuccessAction
  | FetchStatusQuotesFailAction
  | ExpandStatusQuotesRequestAction
  | ExpandStatusQuotesSuccessAction
  | ExpandStatusQuotesFailAction;

export {
  STATUS_QUOTES_FETCH_REQUEST,
  STATUS_QUOTES_FETCH_SUCCESS,
  STATUS_QUOTES_FETCH_FAIL,
  STATUS_QUOTES_EXPAND_REQUEST,
  STATUS_QUOTES_EXPAND_SUCCESS,
  STATUS_QUOTES_EXPAND_FAIL,
  fetchStatusQuotes,
  expandStatusQuotes,
  type StatusQuotesAction,
};

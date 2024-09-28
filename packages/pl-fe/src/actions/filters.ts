import { defineMessages } from 'react-intl';

import { getClient } from 'pl-fe/api';
import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import type { FilterContext } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const FILTERS_FETCH_REQUEST = 'FILTERS_FETCH_REQUEST' as const;
const FILTERS_FETCH_SUCCESS = 'FILTERS_FETCH_SUCCESS' as const;
const FILTERS_FETCH_FAIL = 'FILTERS_FETCH_FAIL' as const;

const FILTER_FETCH_REQUEST = 'FILTER_FETCH_REQUEST' as const;
const FILTER_FETCH_SUCCESS = 'FILTER_FETCH_SUCCESS' as const;
const FILTER_FETCH_FAIL = 'FILTER_FETCH_FAIL' as const;

const FILTERS_CREATE_REQUEST = 'FILTERS_CREATE_REQUEST' as const;
const FILTERS_CREATE_SUCCESS = 'FILTERS_CREATE_SUCCESS' as const;
const FILTERS_CREATE_FAIL = 'FILTERS_CREATE_FAIL' as const;

const FILTERS_UPDATE_REQUEST = 'FILTERS_UPDATE_REQUEST' as const;
const FILTERS_UPDATE_SUCCESS = 'FILTERS_UPDATE_SUCCESS' as const;
const FILTERS_UPDATE_FAIL = 'FILTERS_UPDATE_FAIL' as const;

const FILTERS_DELETE_REQUEST = 'FILTERS_DELETE_REQUEST' as const;
const FILTERS_DELETE_SUCCESS = 'FILTERS_DELETE_SUCCESS' as const;
const FILTERS_DELETE_FAIL = 'FILTERS_DELETE_FAIL' as const;

const messages = defineMessages({
  added: { id: 'filters.added', defaultMessage: 'Filter added.' },
  removed: { id: 'filters.removed', defaultMessage: 'Filter deleted.' },
});

type FilterKeywords = { keyword: string; whole_word: boolean }[];

const fetchFilters = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({
      type: FILTERS_FETCH_REQUEST,
    });

    return getClient(getState).filtering.getFilters()
      .then((data) => dispatch({
        type: FILTERS_FETCH_SUCCESS,
        filters: data,
      }))
      .catch(err => dispatch({
        type: FILTERS_FETCH_FAIL,
        err,
        skipAlert: true,
      }));
  };

const fetchFilter = (filterId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTER_FETCH_REQUEST });

    return getClient(getState).filtering.getFilter(filterId)
      .then((data) => {
        dispatch({
          type: FILTER_FETCH_SUCCESS,
          filter: data,
        });

        return data;
      })
      .catch(err => {
        dispatch({
          type: FILTER_FETCH_FAIL,
          err,
          skipAlert: true,
        });
      });
  };

const createFilter = (title: string, expires_in: number | undefined, context: Array<FilterContext>, hide: boolean, keywords_attributes: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_CREATE_REQUEST });

    return getClient(getState).filtering.createFilter({
      title,
      context,
      filter_action: hide ? 'hide' : 'warn',
      expires_in,
      keywords_attributes,
    }).then(response => {
      dispatch({ type: FILTERS_CREATE_SUCCESS, filter: response });
      toast.success(messages.added);

      return response;
    }).catch(error => {
      dispatch({ type: FILTERS_CREATE_FAIL, error });
    });
  };

const updateFilter = (filterId: string, title: string, expires_in: number | undefined, context: Array<FilterContext>, hide: boolean, keywords_attributes: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_UPDATE_REQUEST });

    return getClient(getState).filtering.updateFilter(filterId, {
      title,
      context,
      filter_action: hide ? 'hide' : 'warn',
      expires_in,
      keywords_attributes,
    }).then(response => {
      dispatch({ type: FILTERS_UPDATE_SUCCESS, filter: response });
      toast.success(messages.added);

      return response;
    }).catch(error => {
      dispatch({ type: FILTERS_UPDATE_FAIL, filterId, error });
    });
  };

const deleteFilter = (filterId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_DELETE_REQUEST });
    return getClient(getState).filtering.deleteFilter(filterId).then(response => {
      dispatch({ type: FILTERS_DELETE_SUCCESS, filterId });
      toast.success(messages.removed);

      return response;
    }).catch(error => {
      dispatch({ type: FILTERS_DELETE_FAIL, filterId, error });
    });
  };

export {
  FILTERS_FETCH_REQUEST,
  FILTERS_FETCH_SUCCESS,
  FILTERS_FETCH_FAIL,
  FILTER_FETCH_REQUEST,
  FILTER_FETCH_SUCCESS,
  FILTER_FETCH_FAIL,
  FILTERS_CREATE_REQUEST,
  FILTERS_CREATE_SUCCESS,
  FILTERS_CREATE_FAIL,
  FILTERS_UPDATE_REQUEST,
  FILTERS_UPDATE_SUCCESS,
  FILTERS_UPDATE_FAIL,
  FILTERS_DELETE_REQUEST,
  FILTERS_DELETE_SUCCESS,
  FILTERS_DELETE_FAIL,
  fetchFilters,
  fetchFilter,
  createFilter,
  updateFilter,
  deleteFilter,
};

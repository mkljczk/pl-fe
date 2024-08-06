import { defineMessages } from 'react-intl';

import toast from 'soapbox/toast';
import { isLoggedIn } from 'soapbox/utils/auth';

import { getClient } from '../api';

import type { FilterContext } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';

const FILTERS_FETCH_REQUEST = 'FILTERS_FETCH_REQUEST';
const FILTERS_FETCH_SUCCESS = 'FILTERS_FETCH_SUCCESS';
const FILTERS_FETCH_FAIL    = 'FILTERS_FETCH_FAIL';

const FILTER_FETCH_REQUEST = 'FILTER_FETCH_REQUEST';
const FILTER_FETCH_SUCCESS = 'FILTER_FETCH_SUCCESS';
const FILTER_FETCH_FAIL    = 'FILTER_FETCH_FAIL';

const FILTERS_CREATE_REQUEST = 'FILTERS_CREATE_REQUEST';
const FILTERS_CREATE_SUCCESS = 'FILTERS_CREATE_SUCCESS';
const FILTERS_CREATE_FAIL    = 'FILTERS_CREATE_FAIL';

const FILTERS_UPDATE_REQUEST = 'FILTERS_UPDATE_REQUEST';
const FILTERS_UPDATE_SUCCESS = 'FILTERS_UPDATE_SUCCESS';
const FILTERS_UPDATE_FAIL    = 'FILTERS_UPDATE_FAIL';

const FILTERS_DELETE_REQUEST = 'FILTERS_DELETE_REQUEST';
const FILTERS_DELETE_SUCCESS = 'FILTERS_DELETE_SUCCESS';
const FILTERS_DELETE_FAIL    = 'FILTERS_DELETE_FAIL';

const messages = defineMessages({
  added: { id: 'filters.added', defaultMessage: 'Filter added.' },
  removed: { id: 'filters.removed', defaultMessage: 'Filter deleted.' },
});

type FilterKeywords = { keyword: string; whole_word: boolean }[];

const fetchFilters = (fromFiltersPage = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({
      type: FILTERS_FETCH_REQUEST,
      skipLoading: true,
    });

    return getClient(getState).filtering.getFilters()
      .then((data) => dispatch({
        type: FILTERS_FETCH_SUCCESS,
        filters: data,
        skipLoading: true,
      }))
      .catch(err => dispatch({
        type: FILTERS_FETCH_FAIL,
        err,
        skipLoading: true,
        skipAlert: true,
      }));
  };

const fetchFilter = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: FILTER_FETCH_REQUEST,
      skipLoading: true,
    });

    return getClient(getState).filtering.getFilter(id)
      .then((data) => dispatch({
        type: FILTER_FETCH_SUCCESS,
        filter: data,
        skipLoading: true,
      }))
      .catch(err => dispatch({
        type: FILTER_FETCH_FAIL,
        err,
        skipLoading: true,
        skipAlert: true,
      }));
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
    }).catch(error => {
      dispatch({ type: FILTERS_CREATE_FAIL, error });
    });
  };

const updateFilter = (id: string, title: string, expires_in: number | undefined, context: Array<FilterContext>, hide: boolean, keywords_attributes: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_UPDATE_REQUEST });

    return getClient(getState).filtering.updateFilter(id, {
      title,
      context,
      filter_action: hide ? 'hide' : 'warn',
      expires_in,
      keywords_attributes,
    }).then(response => {
      dispatch({ type: FILTERS_UPDATE_SUCCESS, filter: response });
      toast.success(messages.added);
    }).catch(error => {
      dispatch({ type: FILTERS_UPDATE_FAIL, error });
    });
  };

const deleteFilter = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_DELETE_REQUEST });
    return getClient(getState).filtering.deleteFilter(id).then(response => {
      dispatch({ type: FILTERS_DELETE_SUCCESS, filter: response });
      toast.success(messages.removed);
    }).catch(error => {
      dispatch({ type: FILTERS_DELETE_FAIL, error });
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

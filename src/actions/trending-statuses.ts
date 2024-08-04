import { getFeatures } from 'soapbox/utils/features';

import { getClient } from '../api';

import { importFetchedStatuses } from './importer';

import type { AppDispatch, RootState } from 'soapbox/store';

const TRENDING_STATUSES_FETCH_REQUEST = 'TRENDING_STATUSES_FETCH_REQUEST';
const TRENDING_STATUSES_FETCH_SUCCESS = 'TRENDING_STATUSES_FETCH_SUCCESS';
const TRENDING_STATUSES_FETCH_FAIL    = 'TRENDING_STATUSES_FETCH_FAIL';

const fetchTrendingStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const instance = state.instance;
    const features = getFeatures(instance);

    if (!features.trendingStatuses) return;

    dispatch({ type: TRENDING_STATUSES_FETCH_REQUEST });

    return getClient(getState()).trends.getTrendingStatuses().then((statuses) => {
      dispatch(importFetchedStatuses(statuses));
      dispatch({ type: TRENDING_STATUSES_FETCH_SUCCESS, statuses });
      return statuses;
    }).catch(error => {
      dispatch({ type: TRENDING_STATUSES_FETCH_FAIL, error });
    });
  };

export {
  TRENDING_STATUSES_FETCH_REQUEST,
  TRENDING_STATUSES_FETCH_SUCCESS,
  TRENDING_STATUSES_FETCH_FAIL,
  fetchTrendingStatuses,
};

import api from '../api';

const PUSH_SUBSCRIPTION_CREATE_REQUEST = 'PUSH_SUBSCRIPTION_CREATE_REQUEST';
const PUSH_SUBSCRIPTION_CREATE_SUCCESS = 'PUSH_SUBSCRIPTION_CREATE_SUCCESS';
const PUSH_SUBSCRIPTION_CREATE_FAIL    = 'PUSH_SUBSCRIPTION_CREATE_FAIL';

const PUSH_SUBSCRIPTION_FETCH_REQUEST = 'PUSH_SUBSCRIPTION_FETCH_REQUEST';
const PUSH_SUBSCRIPTION_FETCH_SUCCESS = 'PUSH_SUBSCRIPTION_FETCH_SUCCESS';
const PUSH_SUBSCRIPTION_FETCH_FAIL    = 'PUSH_SUBSCRIPTION_FETCH_FAIL';

const PUSH_SUBSCRIPTION_UPDATE_REQUEST = 'PUSH_SUBSCRIPTION_UPDATE_REQUEST';
const PUSH_SUBSCRIPTION_UPDATE_SUCCESS = 'PUSH_SUBSCRIPTION_UPDATE_SUCCESS';
const PUSH_SUBSCRIPTION_UPDATE_FAIL    = 'PUSH_SUBSCRIPTION_UPDATE_FAIL';

const PUSH_SUBSCRIPTION_DELETE_REQUEST = 'PUSH_SUBSCRIPTION_DELETE_REQUEST';
const PUSH_SUBSCRIPTION_DELETE_SUCCESS = 'PUSH_SUBSCRIPTION_DELETE_SUCCESS';
const PUSH_SUBSCRIPTION_DELETE_FAIL    = 'PUSH_SUBSCRIPTION_DELETE_FAIL';

import type { AppDispatch, RootState } from 'soapbox/store';

const createPushSubscription = (params: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: PUSH_SUBSCRIPTION_CREATE_REQUEST, params });
    return api(getState)('/api/v1/push/subscription', {
      method: 'POST',
      body: JSON.stringify(params),
    }).then(({ json: subscription }) =>
      dispatch({ type: PUSH_SUBSCRIPTION_CREATE_SUCCESS, params, subscription }),
    ).catch(error =>
      dispatch({ type: PUSH_SUBSCRIPTION_CREATE_FAIL, params, error }),
    );
  };

const fetchPushSubscription = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: PUSH_SUBSCRIPTION_FETCH_REQUEST });
    return api(getState)('/api/v1/push/subscription').then(({ json: subscription }) =>
      dispatch({ type: PUSH_SUBSCRIPTION_FETCH_SUCCESS, subscription }),
    ).catch(error =>
      dispatch({ type: PUSH_SUBSCRIPTION_FETCH_FAIL, error }),
    );
  };

const updatePushSubscription = (params: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: PUSH_SUBSCRIPTION_UPDATE_REQUEST, params });
    return api(getState)('/api/v1/push/subscription', {
      method: 'PUT',
      body: JSON.stringify(params),
    }).then(({ json: subscription }) =>
      dispatch({ type: PUSH_SUBSCRIPTION_UPDATE_SUCCESS, params, subscription }),
    ).catch(error =>
      dispatch({ type: PUSH_SUBSCRIPTION_UPDATE_FAIL, params, error }),
    );
  };

const deletePushSubscription = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: PUSH_SUBSCRIPTION_DELETE_REQUEST });
    return api(getState)('/api/v1/push/subscription', { method: 'DELETE' }).then(() =>
      dispatch({ type: PUSH_SUBSCRIPTION_DELETE_SUCCESS }),
    ).catch(error =>
      dispatch({ type: PUSH_SUBSCRIPTION_DELETE_FAIL, error }),
    );
  };

export {
  PUSH_SUBSCRIPTION_CREATE_REQUEST,
  PUSH_SUBSCRIPTION_CREATE_SUCCESS,
  PUSH_SUBSCRIPTION_CREATE_FAIL,
  PUSH_SUBSCRIPTION_FETCH_REQUEST,
  PUSH_SUBSCRIPTION_FETCH_SUCCESS,
  PUSH_SUBSCRIPTION_FETCH_FAIL,
  PUSH_SUBSCRIPTION_UPDATE_REQUEST,
  PUSH_SUBSCRIPTION_UPDATE_SUCCESS,
  PUSH_SUBSCRIPTION_UPDATE_FAIL,
  PUSH_SUBSCRIPTION_DELETE_REQUEST,
  PUSH_SUBSCRIPTION_DELETE_SUCCESS,
  PUSH_SUBSCRIPTION_DELETE_FAIL,
  createPushSubscription,
  fetchPushSubscription,
  updatePushSubscription,
  deletePushSubscription,
};

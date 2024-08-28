import { getClient } from '../api';

import type { CreatePushNotificationsSubscriptionParams, UpdatePushNotificationsSubscriptionParams } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const createPushSubscription = (params: CreatePushNotificationsSubscriptionParams) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).pushNotifications.createSubscription(params);

const fetchPushSubscription = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).pushNotifications.getSubscription();

const updatePushSubscription = (params: UpdatePushNotificationsSubscriptionParams) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).pushNotifications.updateSubscription(params);

const deletePushSubscription = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).pushNotifications.deleteSubscription();

export {
  createPushSubscription,
  fetchPushSubscription,
  updatePushSubscription,
  deletePushSubscription,
};

import type { WebPushSubscription } from 'pl-api';

const SET_BROWSER_SUPPORT = 'PUSH_NOTIFICATIONS_SET_BROWSER_SUPPORT' as const;
const SET_SUBSCRIPTION = 'PUSH_NOTIFICATIONS_SET_SUBSCRIPTION' as const;
const CLEAR_SUBSCRIPTION = 'PUSH_NOTIFICATIONS_CLEAR_SUBSCRIPTION' as const;
const SET_ALERTS = 'PUSH_NOTIFICATIONS_SET_ALERTS' as const;

const setBrowserSupport = (value: boolean) => ({
  type: SET_BROWSER_SUPPORT,
  value,
});

const setSubscription = (subscription: WebPushSubscription) => ({
  type: SET_SUBSCRIPTION,
  subscription,
});

const clearSubscription = () => ({
  type: CLEAR_SUBSCRIPTION,
});

const setAlerts = (path: Array<string>, value: any) => ({
  type: SET_ALERTS,
  path,
  value,
});

type SetterAction =
  | ReturnType<typeof setBrowserSupport>
  | ReturnType<typeof setSubscription>
  | ReturnType<typeof clearSubscription>
  | ReturnType<typeof setAlerts>;

export {
  SET_BROWSER_SUPPORT,
  SET_SUBSCRIPTION,
  CLEAR_SUBSCRIPTION,
  SET_ALERTS,
  setBrowserSupport,
  setSubscription,
  clearSubscription,
  setAlerts,
  type SetterAction,
};

import IntlMessageFormat from 'intl-messageformat';
import 'intl-pluralrules';
import { defineMessages } from 'react-intl';

import { getClient } from 'soapbox/api';
import { getNotificationStatus } from 'soapbox/features/notifications/components/notification';
import { normalizeNotification, normalizeNotifications, type Notification } from 'soapbox/normalizers';
import { getFilters, regexFromFilters } from 'soapbox/selectors';
import { isLoggedIn } from 'soapbox/utils/auth';
import { compareId } from 'soapbox/utils/comparators';
import { unescapeHTML } from 'soapbox/utils/html';
import { EXCLUDE_TYPES, NOTIFICATION_TYPES } from 'soapbox/utils/notification';
import { joinPublicPath } from 'soapbox/utils/static';

import { fetchRelationships } from './accounts';
import {
  importFetchedAccount,
  importFetchedAccounts,
  importFetchedStatus,
  importFetchedStatuses,
} from './importer';
import { saveMarker } from './markers';
import { getSettings, saveSettings } from './settings';

import type { Account, Notification as BaseNotification, PaginatedResponse, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';

const NOTIFICATIONS_UPDATE = 'NOTIFICATIONS_UPDATE' as const;
const NOTIFICATIONS_UPDATE_NOOP = 'NOTIFICATIONS_UPDATE_NOOP' as const;
const NOTIFICATIONS_UPDATE_QUEUE = 'NOTIFICATIONS_UPDATE_QUEUE' as const;
const NOTIFICATIONS_DEQUEUE = 'NOTIFICATIONS_DEQUEUE' as const;

const NOTIFICATIONS_EXPAND_REQUEST = 'NOTIFICATIONS_EXPAND_REQUEST' as const;
const NOTIFICATIONS_EXPAND_SUCCESS = 'NOTIFICATIONS_EXPAND_SUCCESS' as const;
const NOTIFICATIONS_EXPAND_FAIL = 'NOTIFICATIONS_EXPAND_FAIL' as const;

const NOTIFICATIONS_FILTER_SET = 'NOTIFICATIONS_FILTER_SET' as const;

const NOTIFICATIONS_CLEAR = 'NOTIFICATIONS_CLEAR' as const;
const NOTIFICATIONS_SCROLL_TOP = 'NOTIFICATIONS_SCROLL_TOP' as const;

const NOTIFICATIONS_MARK_READ_REQUEST = 'NOTIFICATIONS_MARK_READ_REQUEST' as const;
const NOTIFICATIONS_MARK_READ_SUCCESS = 'NOTIFICATIONS_MARK_READ_SUCCESS' as const;
const NOTIFICATIONS_MARK_READ_FAIL = 'NOTIFICATIONS_MARK_READ_FAIL' as const;

const MAX_QUEUED_NOTIFICATIONS = 40;

const FILTER_TYPES = {
  all: undefined,
  mention: ['mention'],
  favourite: ['favourite', 'emoji_reaction'],
  reblog: ['reblog'],
  poll: ['poll'],
  status: ['status'],
  follow: ['follow', 'follow_request'],
  events: ['event_reminder', 'participation_request', 'participation_accepted'],
};

type FilterType = keyof typeof FILTER_TYPES;

defineMessages({
  mention: { id: 'notification.mention', defaultMessage: '{name} mentioned you' },
});

const fetchRelatedRelationships = (dispatch: AppDispatch, notifications: Array<BaseNotification>) => {
  const accountIds = notifications.filter(item => item.type === 'follow').map(item => item.account.id);

  if (accountIds.length > 0) {
    dispatch(fetchRelationships(accountIds));
  }
};

const updateNotifications = (notification: BaseNotification) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const showInColumn = getSettings(getState()).getIn(['notifications', 'shows', notification.type], true);

    if (notification.account) {
      dispatch(importFetchedAccount(notification.account));
    }

    // Used by Move notification
    if (notification.type === 'move' && notification.target) {
      dispatch(importFetchedAccount(notification.target));
    }

    const status = getNotificationStatus(notification);

    if (status) {
      dispatch(importFetchedStatus(status));
    }

    if (showInColumn) {
      dispatch({
        type: NOTIFICATIONS_UPDATE,
        notification: normalizeNotification(notification),
      });

      fetchRelatedRelationships(dispatch, [notification]);
    }
  };

const updateNotificationsQueue = (notification: BaseNotification, intlMessages: Record<string, string>, intlLocale: string, curPath: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!notification.type) return; // drop invalid notifications
    if (notification.type === 'chat_mention') return; // Drop chat notifications, handle them per-chat

    const filters = getFilters(getState(), { contextType: 'notifications' });
    const playSound = getSettings(getState()).getIn(['notifications', 'sounds', notification.type]);

    const status = getNotificationStatus(notification);

    let filtered: boolean | null = false;

    const isOnNotificationsPage = curPath === '/notifications';

    if (notification.type === 'mention' || notification.type === 'status') {
      const regex = regexFromFilters(filters);
      const searchIndex = notification.status.spoiler_text + '\n' + unescapeHTML(notification.status.content);
      filtered = regex && regex.test(searchIndex);
    }

    // Desktop notifications
    try {
      // eslint-disable-next-line compat/compat
      const isNotificationsEnabled = window.Notification?.permission === 'granted';

      if (!filtered && isNotificationsEnabled) {
        const title = new IntlMessageFormat(intlMessages[`notification.${notification.type}`], intlLocale).format({ name: notification.account.display_name.length > 0 ? notification.account.display_name : notification.account.username }) as string;
        const body = (status && status.spoiler_text.length > 0) ? status.spoiler_text : unescapeHTML(status ? status.content : '');

        navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
          serviceWorkerRegistration.showNotification(title, {
            body,
            icon: notification.account.avatar,
            tag: notification.id,
            data: {
              url: joinPublicPath('/notifications'),
            },
          }).catch(console.error);
        }).catch(console.error);
      }
    } catch (e) {
      console.warn(e);
    }

    if (playSound && !filtered) {
      dispatch({
        type: NOTIFICATIONS_UPDATE_NOOP,
        meta: { sound: 'boop' },
      });
    }

    if (isOnNotificationsPage) {
      dispatch({
        type: NOTIFICATIONS_UPDATE_QUEUE,
        notification,
        intlMessages,
        intlLocale,
      });
    } else {
      dispatch(updateNotifications(notification));
    }
  };

const dequeueNotifications = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const queuedNotifications = getState().notifications.queuedNotifications;
    const totalQueuedNotificationsCount = getState().notifications.totalQueuedNotificationsCount;

    if (totalQueuedNotificationsCount === 0) {
      return;
    } else if (totalQueuedNotificationsCount > 0 && totalQueuedNotificationsCount <= MAX_QUEUED_NOTIFICATIONS) {
      queuedNotifications.forEach((block) => {
        dispatch(updateNotifications(block.notification));
      });
    } else {
      dispatch(expandNotifications());
    }

    dispatch({
      type: NOTIFICATIONS_DEQUEUE,
    });
    dispatch(markReadNotifications());
  };

const excludeTypesFromFilter = (filters: string[]) => NOTIFICATION_TYPES.filter(item => !filters.includes(item));

const noOp = () => new Promise(f => f(undefined));

let abortExpandNotifications = new AbortController();

const expandNotifications = ({ maxId }: Record<string, any> = {}, done: () => any = noOp, abort?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp);
    const state = getState();

    const features = state.auth.client.features;
    const activeFilter = getSettings(state).getIn(['notifications', 'quickFilter', 'active']) as FilterType;
    const notifications = state.notifications;

    if (notifications.isLoading) {
      if (abort) {
        abortExpandNotifications.abort();
        abortExpandNotifications = new AbortController();
      } else {
        done();
        return dispatch(noOp);
      }
    }

    if (maxId?.includes('+')) {
      const ids = maxId.split('+');

      maxId = ids[ids.length - 1];
    }

    const params: Record<string, any> = {
      max_id: maxId,
    };

    if (activeFilter === 'all') {
      if (features.notificationsIncludeTypes) {
        params.types = NOTIFICATION_TYPES.filter(type => !EXCLUDE_TYPES.includes(type as any));
      } else {
        params.exclude_types = EXCLUDE_TYPES;
      }
    } else {
      const filtered = FILTER_TYPES[activeFilter] || [activeFilter];
      if (features.notificationsIncludeTypes) {
        params.types = filtered;
      } else {
        params.exclude_types = excludeTypesFromFilter(filtered);
      }
    }

    if (!maxId && notifications.items.size > 0) {
      params.since_id = notifications.getIn(['items', 0, 'id']);
    }

    dispatch(expandNotificationsRequest());

    return getClient(state).notifications.getNotifications(params, { signal: abortExpandNotifications.signal }).then(response => {
      const entries = (response.items).reduce((acc, item) => {
        if (item.account?.id) {
          acc.accounts[item.account.id] = item.account;
        }

        // Used by Move notification
        if (item.type === 'move' && item.target.id) {
          acc.accounts[item.target.id] = item.target;
        }

        // TODO actually check for type
        // @ts-ignore
        if (item.status?.id) {
          // @ts-ignore
          acc.statuses[item.status.id] = item.status;
        }

        return acc;
      }, { accounts: {}, statuses: {} } as { accounts: Record<string, Account>; statuses: Record<string, Status> });

      dispatch(importFetchedAccounts(Object.values(entries.accounts)));
      dispatch(importFetchedStatuses(Object.values(entries.statuses)));

      const deduplicatedNotifications = normalizeNotifications(response.items);

      dispatch(expandNotificationsSuccess(deduplicatedNotifications, response.next));
      fetchRelatedRelationships(dispatch, response.items);
      done();
    }).catch(error => {
      dispatch(expandNotificationsFail(error));
      done();
    });
  };

const expandNotificationsRequest = () => ({ type: NOTIFICATIONS_EXPAND_REQUEST });

const expandNotificationsSuccess = (notifications: Array<Notification>, next: (() => Promise<PaginatedResponse<BaseNotification>>) | null) => ({
  type: NOTIFICATIONS_EXPAND_SUCCESS,
  notifications,
  next,
});

const expandNotificationsFail = (error: unknown) => ({
  type: NOTIFICATIONS_EXPAND_FAIL,
  error,
});

const scrollTopNotifications = (top: boolean) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: NOTIFICATIONS_SCROLL_TOP,
      top,
    });
    dispatch(markReadNotifications());
  };

const setFilter = (filterType: FilterType, abort?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: NOTIFICATIONS_FILTER_SET,
      path: ['notifications', 'quickFilter', 'active'],
      value: filterType,
    });
    dispatch(expandNotifications(undefined, undefined, abort));
    if (getSettings(getState()).getIn(['notifications', 'quickFilter', 'active']) !== filterType) dispatch(saveSettings());
  };

const markReadNotifications = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const state = getState();
    let topNotificationId = state.notifications.items.first()?.id;
    const lastReadId = state.notifications.lastRead;

    if (typeof topNotificationId === 'string' && topNotificationId?.includes('+')) {
      topNotificationId = topNotificationId.split('+')[0];
    }

    if (topNotificationId && (lastReadId === -1 || compareId(topNotificationId, lastReadId) > 0)) {
      const marker = {
        notifications: {
          last_read_id: topNotificationId,
        },
      };

      dispatch(saveMarker(marker));
    }
  };

export {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_UPDATE_NOOP,
  NOTIFICATIONS_UPDATE_QUEUE,
  NOTIFICATIONS_DEQUEUE,
  NOTIFICATIONS_EXPAND_REQUEST,
  NOTIFICATIONS_EXPAND_SUCCESS,
  NOTIFICATIONS_EXPAND_FAIL,
  NOTIFICATIONS_FILTER_SET,
  NOTIFICATIONS_CLEAR,
  NOTIFICATIONS_SCROLL_TOP,
  NOTIFICATIONS_MARK_READ_REQUEST,
  NOTIFICATIONS_MARK_READ_SUCCESS,
  NOTIFICATIONS_MARK_READ_FAIL,
  MAX_QUEUED_NOTIFICATIONS,
  type FilterType,
  updateNotifications,
  updateNotificationsQueue,
  dequeueNotifications,
  expandNotifications,
  expandNotificationsRequest,
  expandNotificationsSuccess,
  expandNotificationsFail,
  scrollTopNotifications,
  setFilter,
  markReadNotifications,
};

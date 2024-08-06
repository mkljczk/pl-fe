import IntlMessageFormat from 'intl-messageformat';
import 'intl-pluralrules';
import { defineMessages } from 'react-intl';

import { getClient } from 'soapbox/api';
import { getFilters, regexFromFilters } from 'soapbox/selectors';
import { isLoggedIn } from 'soapbox/utils/auth';
import { compareId } from 'soapbox/utils/comparators';
import { getFeatures, parseVersion, PLEROMA } from 'soapbox/utils/features';
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

import type { Account, Notification, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const NOTIFICATIONS_UPDATE      = 'NOTIFICATIONS_UPDATE';
const NOTIFICATIONS_UPDATE_NOOP = 'NOTIFICATIONS_UPDATE_NOOP';
const NOTIFICATIONS_UPDATE_QUEUE = 'NOTIFICATIONS_UPDATE_QUEUE';
const NOTIFICATIONS_DEQUEUE      = 'NOTIFICATIONS_DEQUEUE';

const NOTIFICATIONS_EXPAND_REQUEST = 'NOTIFICATIONS_EXPAND_REQUEST';
const NOTIFICATIONS_EXPAND_SUCCESS = 'NOTIFICATIONS_EXPAND_SUCCESS';
const NOTIFICATIONS_EXPAND_FAIL    = 'NOTIFICATIONS_EXPAND_FAIL';

const NOTIFICATIONS_FILTER_SET = 'NOTIFICATIONS_FILTER_SET';

const NOTIFICATIONS_CLEAR      = 'NOTIFICATIONS_CLEAR';
const NOTIFICATIONS_SCROLL_TOP = 'NOTIFICATIONS_SCROLL_TOP';

const NOTIFICATIONS_MARK_READ_REQUEST = 'NOTIFICATIONS_MARK_READ_REQUEST';
const NOTIFICATIONS_MARK_READ_SUCCESS = 'NOTIFICATIONS_MARK_READ_SUCCESS';
const NOTIFICATIONS_MARK_READ_FAIL    = 'NOTIFICATIONS_MARK_READ_FAIL';

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

const fetchRelatedRelationships = (dispatch: AppDispatch, notifications: APIEntity[]) => {
  const accountIds = notifications.filter(item => item.type === 'follow').map(item => item.account.id);

  if (accountIds.length > 0) {
    dispatch(fetchRelationships(accountIds));
  }
};

const updateNotifications = (notification: APIEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const showInColumn = getSettings(getState()).getIn(['notifications', 'shows', notification.type], true);

    if (notification.account) {
      dispatch(importFetchedAccount(notification.account));
    }

    // Used by Move notification
    if (notification.target) {
      dispatch(importFetchedAccount(notification.target));
    }

    if (notification.status) {
      dispatch(importFetchedStatus(notification.status));
    }

    if (showInColumn) {
      dispatch({
        type: NOTIFICATIONS_UPDATE,
        notification,
      });

      fetchRelatedRelationships(dispatch, [notification]);
    }
  };

const updateNotificationsQueue = (notification: APIEntity, intlMessages: Record<string, string>, intlLocale: string, curPath: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!notification.type) return; // drop invalid notifications
    if (notification.type === 'pleroma:chat_mention') return; // Drop chat notifications, handle them per-chat

    const filters = getFilters(getState(), { contextType: 'notifications' });
    const playSound = getSettings(getState()).getIn(['notifications', 'sounds', notification.type]);

    let filtered: boolean | null = false;

    const isOnNotificationsPage = curPath === '/notifications';

    if (['mention', 'status'].includes(notification.type)) {
      const regex = regexFromFilters(filters);
      const searchIndex = notification.status.spoiler_text + '\n' + unescapeHTML(notification.status.content);
      filtered = regex && regex.test(searchIndex);
    }

    // Desktop notifications
    try {
      // eslint-disable-next-line compat/compat
      const isNotificationsEnabled = window.Notification?.permission === 'granted';

      if (!filtered && isNotificationsEnabled) {
        const title = new IntlMessageFormat(intlMessages[`notification.${notification.type}`], intlLocale).format({ name: notification.account.display_name.length > 0 ? notification.account.display_name : notification.account.username });
        const body = (notification.status && notification.status.spoiler_text.length > 0) ? notification.status.spoiler_text : unescapeHTML(notification.status ? notification.status.content : '');

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

const STATUS_NOTIFICATION_TYPES = [
  'favourite',
  'reblog',
  // WIP separate notifications for each reaction?
  // 'emoji_reaction',
  'event_reminder',
  'participation_accepted',
  'participation_request',
];

const deduplicateNotifications = (notifications: any[]) => {
  const deduplicatedNotifications: any[] = [];

  for (const notification of notifications) {
    if (STATUS_NOTIFICATION_TYPES.includes(notification.type)) {
      const existingNotification = deduplicatedNotifications
        .find(deduplicatedNotification => deduplicatedNotification.type === notification.type && deduplicatedNotification.status?.id === notification.status?.id);

      if (existingNotification) {
        if (existingNotification?.accounts) {
          existingNotification.accounts.push(notification.account);
        } else {
          existingNotification.accounts = [existingNotification.account, notification.account];
        }
        existingNotification.id += '+' + notification.id;
      } else {
        deduplicatedNotifications.push(notification);
      }
    } else {
      deduplicatedNotifications.push(notification);
    }
  }

  return deduplicatedNotifications;
};

const expandNotifications = ({ maxId }: Record<string, any> = {}, done: () => any = noOp, abort?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp);

    const state = getState();
    const features = getFeatures(state.instance);
    const activeFilter = getSettings(state).getIn(['notifications', 'quickFilter', 'active']) as FilterType;
    const notifications = state.notifications;
    const isLoadingMore = !!maxId;

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
      const ids =  maxId.split('+');

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

    dispatch(expandNotificationsRequest(isLoadingMore));

    return getClient(state).notifications.getNotifications(params, { signal: abortExpandNotifications.signal }).then(response => {
      const entries = (response.items).reduce((acc, item) => {
        if (item.account?.id) {
          acc.accounts[item.account.id] = item.account;
        }

        // Used by Move notification
        if (item.type === 'move' && item.target.id) {
          acc.accounts[item.target.id] = item.target;
        }

        if (item.status?.id) {
          acc.statuses[item.status.id] = item.status;
        }

        return acc;
      }, { accounts: {}, statuses: {} } as { accounts: Record<string, Account>; statuses: Record<string, Account> });

      dispatch(importFetchedAccounts(Object.values(entries.accounts)));
      dispatch(importFetchedStatuses(Object.values(entries.statuses)));

      const deduplicatedNotifications = deduplicateNotifications(response.items);

      dispatch(expandNotificationsSuccess(deduplicatedNotifications, response.next, isLoadingMore));
      fetchRelatedRelationships(dispatch, response.items);
      done();
    }).catch(error => {
      dispatch(expandNotificationsFail(error, isLoadingMore));
      done();
    });
  };

const expandNotificationsRequest = (isLoadingMore: boolean) => ({
  type: NOTIFICATIONS_EXPAND_REQUEST,
  skipLoading: !isLoadingMore,
});

const expandNotificationsSuccess = (notifications: APIEntity[], next: (() => Promise<PaginatedResponse<Notification>>) | null, isLoadingMore: boolean) => ({
  type: NOTIFICATIONS_EXPAND_SUCCESS,
  notifications,
  next,
  skipLoading: !isLoadingMore,
});

const expandNotificationsFail = (error: unknown, isLoadingMore: boolean) => ({
  type: NOTIFICATIONS_EXPAND_FAIL,
  error,
  skipLoading: !isLoadingMore,
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
  (dispatch: AppDispatch) => {
    dispatch({
      type: NOTIFICATIONS_FILTER_SET,
      path: ['notifications', 'quickFilter', 'active'],
      value: filterType,
    });
    dispatch(expandNotifications(undefined, undefined, abort));
    dispatch(saveSettings());
  };

// Of course Markers don't work properly in Pleroma.
// https://git.pleroma.social/pleroma/pleroma/-/issues/2769
const markReadPleroma = (max_id: string | number) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).request('/api/v1/pleroma/notifications/read', {
      method: 'POST',
      body: { max_id },
    });

const markReadNotifications = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const state = getState();
    let topNotificationId = state.notifications.items.first()?.id;
    const lastReadId = state.notifications.lastRead;
    const v = parseVersion(state.instance.version);

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

      if (v.software === PLEROMA) {
        dispatch(markReadPleroma(topNotificationId));
      }
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
  markReadPleroma,
  markReadNotifications,
};

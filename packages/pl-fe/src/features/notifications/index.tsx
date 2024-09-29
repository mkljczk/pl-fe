import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import {
  scrollTopNotifications,
  dequeueNotifications,
} from 'pl-fe/actions/notifications';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import ScrollTopButton from 'pl-fe/components/scroll-top-button';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { Column, Portal } from 'pl-fe/components/ui';
import PlaceholderNotification from 'pl-fe/features/placeholder/components/placeholder-notification';
import { useAppDispatch, useAppSelector, useSettings } from 'pl-fe/hooks';
import { useNotifications } from 'pl-fe/pl-hooks/hooks/notifications/useNotifications';
import { NotificationType } from 'pl-fe/utils/notification';

import FilterBar from './components/filter-bar';
import Notification from './components/notification';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  queue: { id: 'notifications.queue_label', defaultMessage: 'Click to see {count} new {count, plural, one {notification} other {notifications}}' },
});

const FILTER_TYPES: Record<string, Array<NotificationType> | undefined> = {
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

const Notifications = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const settings = useSettings();

  const activeFilter = settings.notifications.quickFilter.active as FilterType;

  const params = activeFilter === 'all' ? {} : {
    types: FILTER_TYPES[activeFilter] || [activeFilter] as Array<NotificationType>,
  };

  const notificationsQuery = useNotifications(params);

  const notifications = notificationsQuery.data;

  const showFilterBar = settings.notifications.quickFilter.show;
  const totalQueuedNotificationsCount = useAppSelector(state => state.notifications.totalQueuedNotificationsCount || 0);

  const column = useRef<HTMLDivElement>(null);
  const scrollableContentRef = useRef<Array<JSX.Element> | null>(null);

  const handleLoadOlder = useCallback(debounce(() => {
    if (notificationsQuery.hasNextPage) notificationsQuery.fetchNextPage();
  }, 300, { leading: true }), [notificationsQuery.hasNextPage]);

  const handleScroll = useCallback(debounce((startIndex?: number) => {
    dispatch(scrollTopNotifications(startIndex === 0));
  }, 100), []);

  const handleMoveUp = (id: string) => {
    const elementIndex = notifications.findIndex(item => item !== null && item === id) - 1;
    _selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = notifications.findIndex(item => item !== null && item === id) + 1;
    _selectChild(elementIndex);
  };

  const _selectChild = (index: number) => {
    const selector = `[data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();
  };

  const handleDequeueNotifications = useCallback(() => {
    dispatch(dequeueNotifications());
  }, []);

  const handleRefresh = useCallback(() => notificationsQuery.refetch(), []);

  useEffect(() => {
    handleDequeueNotifications();
    dispatch(scrollTopNotifications(true));

    return () => {
      handleLoadOlder.cancel();
      handleScroll.cancel();
      dispatch(scrollTopNotifications(false));
    };
  }, []);

  const emptyMessage = activeFilter === 'all'
    ? <FormattedMessage id='empty_column.notifications' defaultMessage="You don't have any notifications yet. Interact with others to start the conversation." />
    : <FormattedMessage id='empty_column.notifications_filtered' defaultMessage="You don't have any notifications of this type yet." />;

  let scrollableContent: Array<JSX.Element> | null = null;

  const filterBarContainer = showFilterBar
    ? (<FilterBar />)
    : null;

  if (notificationsQuery.isLoading && scrollableContentRef.current) {
    scrollableContent = scrollableContentRef.current;
  } else if (notifications.length > 0 || notificationsQuery.hasNextPage) {
    scrollableContent = notifications.map((notificationId) => (
      <Notification
        key={notificationId}
        id={notificationId}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    ));
  } else {
    scrollableContent = null;
  }

  scrollableContentRef.current = scrollableContent;

  const scrollContainer = (
    <ScrollableList
      isLoading={notificationsQuery.isFetching}
      showLoading={notificationsQuery.isLoading}
      hasMore={notificationsQuery.hasNextPage}
      emptyMessage={emptyMessage}
      placeholderComponent={PlaceholderNotification}
      placeholderCount={20}
      onLoadMore={handleLoadOlder}
      onScroll={handleScroll}
      listClassName={clsx('divide-y divide-solid divide-gray-200 black:divide-gray-800 dark:divide-primary-800', {
        'animate-pulse': notifications.length === 0,
      })}
    >
      {scrollableContent!}
    </ScrollableList>
  );

  return (
    <Column ref={column} label={intl.formatMessage(messages.title)} withHeader={false}>
      {filterBarContainer}

      <Portal>
        <ScrollTopButton
          onClick={handleDequeueNotifications}
          count={totalQueuedNotificationsCount}
          message={messages.queue}
        />
      </Portal>

      <PullToRefresh onRefresh={handleRefresh}>
        {scrollContainer}
      </PullToRefresh>
    </Column>
  );
};

export { Notifications as default, FILTER_TYPES, type FilterType };

import iconArrowsClockwise from '@phosphor-icons/core/regular/arrows-clockwise.svg';
import iconChecks from '@phosphor-icons/core/regular/checks.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import NotificationsColumn from '@/columns/notifications';
import DropdownMenu, { type MenuItem } from '@/components/dropdown-menu';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import {
  type FilterType,
  useMarkNotificationsReadMutation,
  useNotifications,
  useNotificationsUnreadCount,
} from '@/queries/notifications/use-notifications';
import { useSettings } from '@/stores/settings';
import { userTouching } from '@/utils/is-mobile';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  advanced: {
    id: 'preferences.notifications.advanced',
    defaultMessage: 'Show all notification categories',
  },
  includeBots: {
    id: 'preferences.notifications.include_bots',
    defaultMessage: 'Include automated accounts',
  },
  autoMarkRead: {
    id: 'preferences.notifications.auto_mark_read',
    defaultMessage: 'Mark notifications read automatically',
  },
  markRead: {
    id: 'notifications.mark_read',
    defaultMessage: 'Mark notifications read',
  },
  refresh: { id: 'notifications.refresh', defaultMessage: 'Refresh notifications' },
});

const NotificationsMarkReadButton = () => {
  const intl = useIntl();
  const notificationCount = useNotificationsUnreadCount();
  const { mutate: markNotificationsRead } = useMarkNotificationsReadMutation();

  const { data: notifications = [] } = useNotifications('all');

  const handleClick = () => {
    markNotificationsRead(
      notifications[0]?.page_max_id ?? notifications[0]?.most_recent_notification_id,
    );
  };

  return (
    <IconButton
      disabled={!notificationCount}
      className='timeline-refresh-button'
      title={intl.formatMessage(messages.markRead)}
      src={iconChecks}
      onClick={handleClick}
    />
  );
};

interface INotificationsRefreshButton {
  activeFilter?: FilterType;
  hideBots?: boolean;
}

const NotificationsRefreshButton: React.FC<INotificationsRefreshButton> = (props) => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const notificationSettings = useSettings().notifications;
  const { isPending, refetch } = useNotifications(notificationSettings.quickFilter.active);
  const scopeUrl = useScopeUrl();

  const activeFilter = props.activeFilter ?? notificationSettings.quickFilter.active;
  const hideBots = props.hideBots ?? notificationSettings.hideBots;

  if (userTouching.matches) return null;

  const handleClick = () => {
    queryClient.resetQueries({
      queryKey: [scopeUrl, ...queryKeys.notifications.list(activeFilter, hideBots)],
    });
    refetch();
  };

  return (
    <IconButton
      disabled={isPending}
      className='timeline-refresh-button'
      title={intl.formatMessage(messages.refresh)}
      src={iconArrowsClockwise}
      onClick={handleClick}
    />
  );
};

const NotificationsPage: React.FC = () => {
  const intl = useIntl();
  const settings = useSettings();

  const items: Array<MenuItem> = [
    {
      text: intl.formatMessage(messages.advanced),
      type: 'toggle',
      checked: settings.notifications.quickFilter.advanced,
      onChange: (value) => changeSetting(['notifications', 'quickFilter', 'advanced'], value),
    },
    {
      text: intl.formatMessage(messages.includeBots),
      type: 'toggle',
      checked: !settings.notifications.hideBots,
      onChange: (value) => changeSetting(['notifications', 'hideBots'], !value),
    },
    {
      text: intl.formatMessage(messages.autoMarkRead),
      type: 'toggle',
      checked: settings.notifications.autoMarkRead,
      onChange: (value) => changeSetting(['notifications', 'autoMarkRead'], value),
    },
  ];

  return (
    <Column
      label={intl.formatMessage(messages.title)}
      action={
        <>
          {!settings.notifications.autoMarkRead && <NotificationsMarkReadButton />}
          <NotificationsRefreshButton />
          <DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />
        </>
      }
    >
      <NotificationsColumn conditionalPullToRefresh />
    </Column>
  );
};

export { NotificationsPage as default, NotificationsMarkReadButton, NotificationsRefreshButton };

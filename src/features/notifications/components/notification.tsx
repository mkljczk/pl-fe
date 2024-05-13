import { List as ImmutableList } from 'immutable';
import React, { useCallback } from 'react';
import { defineMessages, useIntl, FormattedList, FormattedMessage, IntlShape, MessageDescriptor } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { mentionCompose } from 'soapbox/actions/compose';
import { reblog, favourite, unreblog, unfavourite } from 'soapbox/actions/interactions';
import { openModal } from 'soapbox/actions/modals';
import { getSettings } from 'soapbox/actions/settings';
import { toggleStatusHidden } from 'soapbox/actions/statuses';
import Icon from 'soapbox/components/icon';
import { HStack, Text, Emoji } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import StatusContainer from 'soapbox/containers/status-container';
import { HotKeys } from 'soapbox/features/ui/components/hotkeys';
import { useAppDispatch, useAppSelector, useInstance } from 'soapbox/hooks';
import { makeGetNotification } from 'soapbox/selectors';
import { NotificationType, validType } from 'soapbox/utils/notification';

import type { ScrollPosition } from 'soapbox/components/status';
import type { Account as AccountEntity, Status as StatusEntity, Notification as NotificationEntity,
} from 'soapbox/types/entities';

const notificationForScreenReader = (intl: IntlShape, message: string, timestamp: Date) => {
  const output = [message];

  output.push(intl.formatDate(timestamp, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }));

  return output.join(', ');
};

const buildLink = (account: AccountEntity): JSX.Element => (
  <bdi key={account.acct}>
    <Link
      className='font-bold text-gray-800 hover:underline dark:text-gray-200'
      title={account.acct}
      to={`/@${account.acct}`}
      dangerouslySetInnerHTML={{ __html: account.display_name_html }}
    />
  </bdi>
);

const icons: Record<NotificationType, string> = {
  follow: require('@tabler/icons/outline/user-plus.svg'),
  follow_request: require('@tabler/icons/outline/user-plus.svg'),
  mention: require('@tabler/icons/outline/at.svg'),
  favourite: require('@tabler/icons/outline/heart.svg'),
  reblog: require('@tabler/icons/outline/repeat.svg'),
  status: require('@tabler/icons/outline/bell-ringing.svg'),
  poll: require('@tabler/icons/outline/chart-bar.svg'),
  move: require('@tabler/icons/outline/briefcase.svg'),
  'pleroma:chat_mention': require('@tabler/icons/outline/messages.svg'),
  'pleroma:emoji_reaction': require('@tabler/icons/outline/mood-happy.svg'),
  user_approved: require('@tabler/icons/outline/user-plus.svg'),
  update: require('@tabler/icons/outline/pencil.svg'),
  'pleroma:event_reminder': require('@tabler/icons/outline/calendar-time.svg'),
  'pleroma:participation_request': require('@tabler/icons/outline/calendar-event.svg'),
  'pleroma:participation_accepted': require('@tabler/icons/outline/calendar-event.svg'),
};

const messages: Record<NotificationType, MessageDescriptor> = defineMessages({
  follow: {
    id: 'notification.follow',
    defaultMessage: '{name} followed you',
  },
  follow_request: {
    id: 'notification.follow_request',
    defaultMessage: '{name} has requested to follow you',
  },
  mention: {
    id: 'notification.mentioed',
    defaultMessage: '{name} mentioned you',
  },
  favourite: {
    id: 'notification.favourite',
    defaultMessage: '{name} liked your post',
  },
  reblog: {
    id: 'notification.reblog',
    defaultMessage: '{name} reposted your post',
  },
  status: {
    id: 'notification.status',
    defaultMessage: '{name} just posted',
  },
  poll: {
    id: 'notification.poll',
    defaultMessage: 'A poll you have voted in has ended',
  },
  move: {
    id: 'notification.move',
    defaultMessage: '{name} moved to {targetName}',
  },
  'pleroma:chat_mention': {
    id: 'notification.pleroma:chat_mention',
    defaultMessage: '{name} sent you a message',
  },
  'pleroma:emoji_reaction': {
    id: 'notification.pleroma:emoji_reaction',
    defaultMessage: '{name} reacted to your post',
  },
  user_approved: {
    id: 'notification.user_approved',
    defaultMessage: 'Welcome to {instance}!',
  },
  update: {
    id: 'notification.update',
    defaultMessage: '{name} edited a post you interacted with',
  },
  'pleroma:event_reminder': {
    id: 'notification.pleroma:event_reminder',
    defaultMessage: 'An event you are participating in starts soon',
  },
  'pleroma:participation_request': {
    id: 'notification.pleroma:participation_request',
    defaultMessage: '{name} wants to join your event',
  },
  'pleroma:participation_accepted': {
    id: 'notification.pleroma:participation_accepted',
    defaultMessage: 'You were accepted to join the event',
  },
});

const buildMessage = (
  intl: IntlShape,
  type: NotificationType,
  account: AccountEntity,
  accounts: ImmutableList<AccountEntity> | null,
  targetName: string,
  instanceTitle: string,
): React.ReactNode => {
  if (!accounts) accounts = accounts || ImmutableList([account]);

  const renderedAccounts = accounts.slice(0, 2).map(account => buildLink(account)).toArray().filter(Boolean);

  if (accounts.size > 2) {
    renderedAccounts.push(
      <FormattedMessage
        key='more'
        id='notification.more'
        defaultMessage='{count, plural, one {# other} other {# others}}'
        values={{ count: accounts.size - renderedAccounts.length }}
      />,
    );
  }

  return intl.formatMessage(messages[type], {
    name: <FormattedList type='conjunction' value={renderedAccounts} />,
    targetName,
    instance: instanceTitle,
    count: accounts.size,
  });
};

const avatarSize = 48;

interface INotification {
  hidden?: boolean;
  notification: NotificationEntity;
  onMoveUp?: (notificationId: string) => void;
  onMoveDown?: (notificationId: string) => void;
  onReblog?: (status: StatusEntity, e?: KeyboardEvent) => void;
  getScrollPosition?: () => ScrollPosition | undefined;
  updateScrollBottom?: (bottom: number) => void;
}

const Notification: React.FC<INotification> = (props) => {
  const { hidden = false, onMoveUp, onMoveDown } = props;

  const dispatch = useAppDispatch();

  const getNotification = useCallback(makeGetNotification(), []);

  const notification = useAppSelector((state) => getNotification(state, props.notification));

  const history = useHistory();
  const intl = useIntl();
  const instance = useInstance();

  const type = notification.type;
  const { account, accounts, status } = notification;

  const getHandlers = () => ({
    reply: handleMention,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleMention,
    open: handleOpen,
    openProfile: handleOpenProfile,
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
    toggleSensitive: handleHotkeyToggleSensitive,
  });

  const handleOpen = () => {
    if (status && typeof status === 'object' && account && typeof account === 'object') {
      history.push(`/@${account.acct}/posts/${status.id}`);
    } else {
      handleOpenProfile();
    }
  };

  const handleOpenProfile = () => {
    if (account && typeof account === 'object') {
      history.push(`/@${account.acct}`);
    }
  };

  const handleMention = useCallback((e?: KeyboardEvent) => {
    e?.preventDefault();

    if (account && typeof account === 'object') {
      dispatch(mentionCompose(account));
    }
  }, [account]);

  const handleHotkeyFavourite = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      if (status.favourited) {
        dispatch(unfavourite(status));
      } else {
        dispatch(favourite(status));
      }
    }
  }, [status]);

  const handleHotkeyBoost = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      dispatch((_, getState) => {
        const boostModal = getSettings(getState()).get('boostModal');
        if (status.reblogged) {
          dispatch(unreblog(status));
        } else {
          if (e?.shiftKey || !boostModal) {
            dispatch(reblog(status));
          } else {
            dispatch(openModal('BOOST', { status, onReblog: (status: StatusEntity) => {
              dispatch(reblog(status));
            } }));
          }
        }
      });
    }
  }, [status]);

  const handleHotkeyToggleSensitive = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      dispatch(toggleStatusHidden(status));
    }
  }, [status]);

  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(notification.id);
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(notification.id);
    }
  };

  const renderIcon = (): React.ReactNode => {
    if (type === 'pleroma:emoji_reaction' && notification.emoji) {
      return (
        <Emoji
          emoji={notification.emoji}
          src={notification.emoji_url || undefined}
          className='h-4 w-4 flex-none'
        />
      );
    } else if (validType(type)) {
      return (
        <Icon
          src={icons[type]}
          className='flex-none text-primary-600 dark:text-primary-400'
        />
      );
    } else {
      return null;
    }
  };

  const renderContent = () => {
    switch (type as NotificationType) {
      case 'follow':
      case 'user_approved':
        return account && typeof account === 'object' ? (
          <AccountContainer
            id={account.id}
            hidden={hidden}
            avatarSize={avatarSize}
            withRelationship
          />
        ) : null;
      case 'follow_request':
        return account && typeof account === 'object' ? (
          <AccountContainer
            id={account.id}
            hidden={hidden}
            avatarSize={avatarSize}
            actionType='follow_request'
            withRelationship
          />
        ) : null;
      case 'move':
        return account && typeof account === 'object' && notification.target && typeof notification.target === 'object' ? (
          <AccountContainer
            id={notification.target.id}
            hidden={hidden}
            avatarSize={avatarSize}
            withRelationship
          />
        ) : null;
      case 'favourite':
      case 'mention':
      case 'reblog':
      case 'status':
      case 'poll':
      case 'update':
      case 'pleroma:emoji_reaction':
      case 'pleroma:event_reminder':
      case 'pleroma:participation_accepted':
      case 'pleroma:participation_request':
        return status && typeof status === 'object' ? (
          <StatusContainer
            id={status.id}
            hidden={hidden}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            avatarSize={avatarSize}
            contextType='notifications'
            showGroup={false}
          />
        ) : null;
      default:
        return null;
    }
  };

  const targetName = notification.target && typeof notification.target === 'object' ? notification.target.acct : '';

  const message: React.ReactNode = validType(type) && account && typeof account === 'object'
    ? buildMessage(intl, type, account, accounts as ImmutableList<AccountEntity>, targetName, instance.title)
    : null;

  const ariaLabel = validType(type) ? (
    notificationForScreenReader(
      intl,
      intl.formatMessage(messages[type], {
        name: account && typeof account === 'object' ? account.acct : '',
        targetName,
      }),
      notification.created_at,
    )
  ) : '';

  return (
    <HotKeys handlers={getHandlers()} data-testid='notification'>
      <div
        className='notification focusable'
        tabIndex={0}
        aria-label={ariaLabel}
      >
        <div className='focusable p-4'>
          <div className='mb-2'>
            <HStack alignItems='center' space={3}>
              <div
                className='flex justify-end'
                style={{ flexBasis: avatarSize }}
              >
                {renderIcon()}
              </div>

              <div className='truncate'>
                <Text
                  theme='muted'
                  size='xs'
                  truncate
                  data-testid='message'
                >
                  {message}
                </Text>
              </div>
            </HStack>
          </div>

          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </HotKeys>
  );
};

export { Notification as default };

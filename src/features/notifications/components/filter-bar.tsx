import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { setFilter } from 'soapbox/actions/notifications';
import { Icon, Tabs } from 'soapbox/components/ui';
import { useAppDispatch, useFeatures, useSettings } from 'soapbox/hooks';

import type { Item } from 'soapbox/components/ui/tabs/tabs';

const messages = defineMessages({
  all: { id: 'notifications.filter.all', defaultMessage: 'All' },
  mentions: { id: 'notifications.filter.mentions', defaultMessage: 'Mentions' },
  favourites: { id: 'notifications.filter.favourites', defaultMessage: 'Likes' },
  boosts: { id: 'notifications.filter.boosts', defaultMessage: 'Reposts' },
  polls: { id: 'notifications.filter.polls', defaultMessage: 'Poll results' },
  follows: { id: 'notifications.filter.follows', defaultMessage: 'Follows' },
  emoji_reacts: { id: 'notifications.filter.emoji_reacts', defaultMessage: 'Emoji reacts' },
  statuses: { id: 'notifications.filter.statuses', defaultMessage: 'Updates from people you follow' },
});

const NotificationFilterBar = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const features = useFeatures();

  const selectedFilter = settings.notifications.quickFilter.active;
  const advancedMode = settings.notifications.quickFilter.advanced;

  const onClick = (notificationType: string) => () => dispatch(setFilter(notificationType));

  const items: Item[] = [
    {
      text: intl.formatMessage(messages.all),
      action: onClick('all'),
      name: 'all',
    },
  ];

  if (!advancedMode) {
    items.push({
      text: intl.formatMessage(messages.mentions),
      action: onClick('mention'),
      name: 'mention',
    });
  } else {
    items.push({
      text: <Icon className='h-4 w-4' src={require('@tabler/icons/outline/at.svg')} />,
      title: intl.formatMessage(messages.mentions),
      action: onClick('mention'),
      name: 'mention',
    });
    items.push({
      text:  <Icon className='h-4 w-4' src={require('@tabler/icons/outline/heart.svg')} />,
      title: intl.formatMessage(messages.favourites),
      action: onClick('favourite'),
      name: 'favourite',
    });
    if (features.emojiReacts) items.push({
      text:  <Icon className='h-4 w-4' src={require('@tabler/icons/outline/mood-smile.svg')} />,
      title: intl.formatMessage(messages.emoji_reacts),
      action: onClick('pleroma:emoji_reaction'),
      name: 'pleroma:emoji_reaction',
    });
    items.push({
      text:  <Icon className='h-4 w-4' src={require('@tabler/icons/outline/repeat.svg')} />,
      title: intl.formatMessage(messages.boosts),
      action: onClick('reblog'),
      name: 'reblog',
    });
    if (features.polls) items.push({
      text:  <Icon className='h-4 w-4' src={require('@tabler/icons/outline/chart-bar.svg')} />,
      title: intl.formatMessage(messages.polls),
      action: onClick('poll'),
      name: 'poll',
    });
    if (features.accountNotifies || features.accountSubscriptions) items.push({
      text:  <Icon className='h-4 w-4' src={require('@tabler/icons/outline/bell-ringing.svg')} />,
      title: intl.formatMessage(messages.statuses),
      action: onClick('status'),
      name: 'status',
    });
    items.push({
      text:  <Icon className='h-4 w-4' src={require('@tabler/icons/outline/user-plus.svg')} />,
      title: intl.formatMessage(messages.follows),
      action: onClick('follow'),
      name: 'follow',
    });
  }

  return <Tabs items={items} activeItem={selectedFilter} />;
};

export default NotificationFilterBar;

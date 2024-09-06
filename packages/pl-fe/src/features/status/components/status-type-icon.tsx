import React from 'react';
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl';

import { Icon, Text } from 'pl-fe/components/ui';

import type { Status } from 'pl-fe/normalizers';

interface IStatusTypeIcon {
  status: Pick<Status, 'visibility'>;
}

const messages: Record<string, MessageDescriptor> = defineMessages({
  direct: { id: 'status.visibility.direct', defaultMessage: 'The post is only visible to mentioned users' },
  private: { id: 'status.visibility.private', defaultMessage: 'The post is only visible to followers of the author' },
  mutuals_only: { id: 'status.visibility.mutuals_only', defaultMessage: 'The post is only visible to people who mutually follow the author' },
  local: { id: 'status.visibility.local', defaultMessage: 'The post is only visible to users on your instance' },
  list: { id: 'status.visibility.list', defaultMessage: 'The post is only visible to the members of a list' },
  list_named: { id: 'status.visibility.list.named', defaultMessage: 'The post is only visible to the members of a {name} list' },
});

const STATUS_TYPE_ICONS: Record<string, string> = {
  direct: require('@tabler/icons/outline/mail.svg'),
  private: require('@tabler/icons/outline/lock.svg'),
  mutuals_only: require('@tabler/icons/outline/users-group.svg'),
  local:  require('@tabler/icons/outline/affiliate.svg'),
  list:  require('@tabler/icons/outline/list.svg'),
};

const StatusTypeIcon: React.FC<IStatusTypeIcon> = ({ status }) => {
  const intl = useIntl();

  const icon = STATUS_TYPE_ICONS[status.visibility];
  const message = messages[status.visibility];

  if (!icon) return null;

  return (
    <>
      <Text tag='span' theme='muted' size='sm'>&middot;</Text>

      <Icon title={message ? intl.formatMessage(message) : undefined} className='h-5 w-5 text-gray-700 dark:text-gray-600' src={icon} />
    </>
  );
};

export { StatusTypeIcon as default };

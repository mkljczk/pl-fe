import iconArrowRight from '@phosphor-icons/core/regular/arrow-right.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import NotificationsColumn from '@/columns/notifications';
import Widget from '@/components/ui/widget';
import { NotificationsMarkReadButton } from '@/pages/notifications/notifications';

import Icon from '../ui/icon';

const messages = defineMessages({
  viewAll: { id: 'notifications.view_all', defaultMessage: 'View all' },
});

const NotificationsPanel: React.FC = () => {
  const intl = useIntl();

  return (
    <Widget
      className='notifications-panel'
      title={<FormattedMessage id='column.notifications' defaultMessage='Notifications' />}
      to='/notifications'
      action={
        <div className='widget__icons'>
          <NotificationsMarkReadButton />
          <Link
            className='widget__icon'
            title={intl.formatMessage(messages.viewAll)}
            to='/notifications'
          >
            <Icon src={iconArrowRight} aria-hidden />
          </Link>
        </div>
      }
    >
      <NotificationsColumn multiColumn compact disableAutoMarkRead />
    </Widget>
  );
};

export { NotificationsPanel as default };

import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import { groupComposeModal } from 'pl-fe/actions/compose';
import { openSidebar } from 'pl-fe/actions/sidebar';
import ThumbNavigationLink from 'pl-fe/components/thumb-navigation-link';
import { useStatContext } from 'pl-fe/contexts/stat-context';
import { Entities } from 'pl-fe/entity-store/entities';
import { useAppDispatch, useAppSelector, useFeatures, useOwnAccount } from 'pl-fe/hooks';
import { useModalsStore } from 'pl-fe/stores';
import { isStandalone } from 'pl-fe/utils/state';

import { Icon } from './ui';

const messages = defineMessages({
  home: { id: 'navigation.home', defaultMessage: 'Home' },
  search: { id: 'navigation.search', defaultMessage: 'Search' },
  notifications: { id: 'navigation.notifications', defaultMessage: 'Notifications' },
  chats: { id: 'navigation.chats', defaultMessage: 'Chats' },
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
  sidebar: { id: 'navigation.sidebar', defaultMessage: 'Open sidebar' },
});

const ThumbNavigation: React.FC = (): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();
  const features = useFeatures();

  const match = useRouteMatch<{ groupId: string }>('/groups/:groupId');

  const { openModal } = useModalsStore();
  const { unreadChatsCount } = useStatContext();

  const standalone = useAppSelector(isStandalone);
  const notificationCount = useAppSelector((state) => state.notifications.unread);

  const handleOpenSidebar = () => dispatch(openSidebar());

  const handleOpenComposeModal = () => {
    if (match?.params.groupId) {
      dispatch((_, getState) => {
        const group = getState().entities[Entities.GROUPS]?.store[match.params.groupId];
        if (group) dispatch(groupComposeModal(group));
      });
    } else {
      openModal('COMPOSE');
    }
  };

  const composeButton = (
    <button
      className='flex flex-1 flex-col items-center px-1.5 py-3.5 text-lg text-gray-600'
      onClick={handleOpenComposeModal}
      title={intl.formatMessage(messages.compose)}
    >
      <Icon
        src={require('@tabler/icons/outline/square-rounded-plus.svg')}
        className='h-6 w-6 text-gray-600 black:text-white'
      />
    </button>
  );

  return (
    <div className='fixed inset-x-0 bottom-0 z-50 flex w-full overflow-x-auto border-t border-solid border-gray-200 bg-white/90 shadow-2xl backdrop-blur-md black:bg-black/80 lg:hidden dark:border-gray-800 dark:bg-primary-900/90'>
      <button
        className='flex flex-1 flex-col items-center px-2 py-4 text-lg text-gray-600'
        onClick={handleOpenSidebar}
        title={intl.formatMessage(messages.sidebar)}
      >
        <Icon
          src={require('@tabler/icons/outline/menu-2.svg')}
          className='h-5 w-5 text-gray-600 black:text-white'
        />
      </button>

      <ThumbNavigationLink
        src={require('@tabler/icons/outline/home.svg')}
        activeSrc={require('@tabler/icons/filled/home.svg')}
        text={intl.formatMessage(messages.home)}
        to='/'
        exact
      />

      {/* {features.groups && (
        <ThumbNavigationLink
          src={require('@tabler/icons/outline/circles.svg')}
          activeSrc={require('@tabler/icons/filled/circles.svg')}
          text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
          to='/groups'
          exact
        />
      )} */}

      {account && !features.chats && composeButton}

      {(!standalone || account) && (
        <ThumbNavigationLink
          src={require('@tabler/icons/outline/search.svg')}
          text={intl.formatMessage(messages.search)}
          to='/search'
          exact
        />
      )}

      {account && (
        <ThumbNavigationLink
          src={require('@tabler/icons/outline/bell.svg')}
          activeSrc={require('@tabler/icons/filled/bell.svg')}
          text={intl.formatMessage(messages.notifications)}
          to='/notifications'
          exact
          count={notificationCount}
        />
      )}

      {account && features.chats && (
        <>
          <ThumbNavigationLink
            src={require('@tabler/icons/outline/messages.svg')}
            text={intl.formatMessage(messages.chats)}
            to='/chats'
            exact
            count={unreadChatsCount}
            countMax={9}
          />

          {composeButton}
        </>
      )}
    </div>
  );
};

export { ThumbNavigation as default };

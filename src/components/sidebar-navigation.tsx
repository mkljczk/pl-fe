import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { Icon, Stack } from 'soapbox/components/ui';
import { useStatContext } from 'soapbox/contexts/stat-context';
import Search from 'soapbox/features/compose/components/search';
import ComposeButton from 'soapbox/features/ui/components/compose-button';
import ProfileDropdown from 'soapbox/features/ui/components/profile-dropdown';
import { useAppSelector, useFeatures, useOwnAccount, useSettings, useInstance } from 'soapbox/hooks';

import Account from './account';
import DropdownMenu, { Menu } from './dropdown-menu';
import SidebarNavigationLink from './sidebar-navigation-link';

const messages = defineMessages({
  followRequests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  profileDirectory: { id: 'navigation_bar.profile_directory', defaultMessage: 'Profile directory' },
  followedTags: { id: 'navigation_bar.followed_tags', defaultMessage: 'Followed hashtags' },
  developers: { id: 'navigation.developers', defaultMessage: 'Developers' },
  drafts: { id: 'navigation.drafts', defaultMessage: 'Drafts' },
});

/** Desktop sidebar with links to different views in the app. */
const SidebarNavigation = () => {
  const intl = useIntl();
  const { unreadChatsCount } = useStatContext();

  const instance = useInstance();
  const features = useFeatures();
  const { isDeveloper } = useSettings();
  const { account } = useOwnAccount();

  const notificationCount = useAppSelector((state) => state.notifications.unread);
  const followRequestsCount = useAppSelector((state) => state.user_lists.follow_requests.items.count());
  const dashboardCount = useAppSelector((state) => state.admin.openReports.count() + state.admin.awaitingApproval.count());
  const draftCount = useAppSelector((state) => state.draft_statuses.size);

  const restrictUnauth = instance.pleroma.metadata.restrict_unauthenticated;

  const makeMenu = (): Menu => {
    const menu: Menu = [];

    if (account) {
      if (account.locked || followRequestsCount > 0) {
        menu.push({
          to: '/follow_requests',
          text: intl.formatMessage(messages.followRequests),
          icon: require('@tabler/icons/outline/user-plus.svg'),
          count: followRequestsCount,
        });
      }

      if (features.bookmarks) {
        menu.push({
          to: '/bookmarks',
          text: intl.formatMessage(messages.bookmarks),
          icon: require('@tabler/icons/outline/bookmark.svg'),
        });
      }

      if (features.lists) {
        menu.push({
          to: '/lists',
          text: intl.formatMessage(messages.lists),
          icon: require('@tabler/icons/outline/list.svg'),
        });
      }

      if (features.events) {
        menu.push({
          to: '/events',
          text: intl.formatMessage(messages.events),
          icon: require('@tabler/icons/outline/calendar-event.svg'),
        });
      }

      if (features.profileDirectory) {
        menu.push({
          to: '/directory',
          text: intl.formatMessage(messages.profileDirectory),
          icon: require('@tabler/icons/outline/address-book.svg'),
        });
      }

      if (features.followedHashtagsList) {
        menu.push({
          to: '/followed_tags',
          text: intl.formatMessage(messages.followedTags),
          icon: require('@tabler/icons/outline/hash.svg'),
        });
      }

      if (isDeveloper) {
        menu.push({
          to: '/developers',
          icon: require('@tabler/icons/outline/code.svg'),
          text: intl.formatMessage(messages.developers),
        });
      }

      if (draftCount > 0) {
        menu.push({
          to: '/draft_statuses',
          icon: require('@tabler/icons/outline/notes.svg'),
          text: intl.formatMessage(messages.drafts),
          count: draftCount,
        });
      }
    }

    return menu;
  };

  const menu = makeMenu();

  /** Conditionally render the supported messages link */
  const renderMessagesLink = (): React.ReactNode => {
    if (features.chats) {
      return (
        <SidebarNavigationLink
          to='/chats'
          icon={require('@tabler/icons/outline/messages.svg')}
          count={unreadChatsCount}
          countMax={9}
          text={<FormattedMessage id='navigation.chats' defaultMessage='Chats' />}
        />
      );
    }

    if (features.directTimeline || features.conversations) {
      return (
        <SidebarNavigationLink
          to='/messages'
          icon={require('@tabler/icons/outline/mail.svg')}
          text={<FormattedMessage id='navigation.direct_messages' defaultMessage='Messages' />}
        />
      );
    }

    return null;
  };

  return (
    <Stack space={4}>

      {account && (
        <Stack space={4}>
          <div className='relative flex items-center'>
            <ProfileDropdown account={account}>
              <Account
                account={account}
                action={<Icon src={require('@tabler/icons/outline/chevron-down.svg')} className='text-gray-600 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-500' />}
                disabled
              />
            </ProfileDropdown>
          </div>
          <div className='block w-full max-w-xs'>
            <Search openInRoute autosuggest />
          </div>
        </Stack>
      )}

      <Stack space={1.5}>
        <SidebarNavigationLink
          to='/'
          icon={require('@tabler/icons/outline/home.svg')}
          activeIcon={require('@tabler/icons/filled/home.svg')}
          text={<FormattedMessage id='tabs_bar.home' defaultMessage='Home' />}
        />

        <SidebarNavigationLink
          to='/search'
          icon={require('@tabler/icons/outline/search.svg')}
          text={<FormattedMessage id='tabs_bar.search' defaultMessage='Search' />}
        />

        {account && (
          <>
            <SidebarNavigationLink
              to='/notifications'
              icon={require('@tabler/icons/outline/bell.svg')}
              activeIcon={require('@tabler/icons/filled/bell.svg')}
              count={notificationCount}
              text={<FormattedMessage id='tabs_bar.notifications' defaultMessage='Notifications' />}
            />

            {renderMessagesLink()}

            {features.groups && (
              <SidebarNavigationLink
                to='/groups'
                icon={require('@tabler/icons/outline/circles.svg')}
                activeIcon={require('@tabler/icons/filled/circles.svg')}
                text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
              />
            )}

            <SidebarNavigationLink
              to={`/@${account.acct}`}
              icon={require('@tabler/icons/outline/user.svg')}
              activeIcon={require('@tabler/icons/filled/user.svg')}
              text={<FormattedMessage id='tabs_bar.profile' defaultMessage='Profile' />}
            />

            <SidebarNavigationLink
              to='/settings'
              icon={require('@tabler/icons/outline/settings.svg')}
              activeIcon={require('@tabler/icons/filled/settings.svg')}
              text={<FormattedMessage id='tabs_bar.settings' defaultMessage='Settings' />}
            />

            {account.staff && (
              <SidebarNavigationLink
                to='/soapbox/admin'
                icon={require('@tabler/icons/outline/dashboard.svg')}
                count={dashboardCount}
                text={<FormattedMessage id='tabs_bar.dashboard' defaultMessage='Dashboard' />}
              />
            )}
          </>
        )}

        {(features.publicTimeline) && (
          <>
            {(account || !restrictUnauth.timelines.local) && (
              <SidebarNavigationLink
                to='/timeline/local'
                icon={features.federating ? require('@tabler/icons/outline/affiliate.svg') : require('@tabler/icons/outline/world.svg')}
                activeIcon={features.federating ? require('@tabler/icons/filled/affiliate.svg') : undefined}
                text={features.federating ? <FormattedMessage id='tabs_bar.local' defaultMessage='Local' /> : <FormattedMessage id='tabs_bar.all' defaultMessage='All' />}
              />
            )}

            {(features.federating && (account || !restrictUnauth.timelines.federated)) && (
              <SidebarNavigationLink
                to='/timeline/fediverse'
                icon={require('@tabler/icons/outline/topology-star-ring-3.svg')}
                text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
              />
            )}

            {(features.bubbleTimeline && (account || !restrictUnauth.timelines.bubble)) && (
              <SidebarNavigationLink
                to='/timeline/bubble'
                icon={require('@tabler/icons/outline/chart-bubble.svg')}
                text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
              />
            )}
          </>
        )}

        {menu.length > 0 && (
          <DropdownMenu items={menu} placement='top'>
            <SidebarNavigationLink
              icon={require('@tabler/icons/outline/dots-circle-horizontal.svg')}
              text={<FormattedMessage id='tabs_bar.more' defaultMessage='More' />}
            />
          </DropdownMenu>
        )}

        {!account && (
          <Stack className='xl:hidden' space={1.5}>
            <SidebarNavigationLink
              to='/login'
              icon={require('@tabler/icons/outline/login.svg')}
              text={<FormattedMessage id='account.login' defaultMessage='Log in' />}
            />

            <SidebarNavigationLink
              to='/signup'
              icon={require('@tabler/icons/outline/user-plus.svg')}
              text={<FormattedMessage id='account.register' defaultMessage='Sign up' />}
            />
          </Stack>
        )}
      </Stack>

      {account && (
        <ComposeButton />
      )}
    </Stack>
  );
};

export { SidebarNavigation as default };

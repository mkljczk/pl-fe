/* eslint-disable jsx-a11y/interactive-supports-focus */
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link, NavLink } from 'react-router-dom';

import { fetchOwnAccounts, logOut, switchAccount } from 'pl-fe/actions/auth';
import { getSettings } from 'pl-fe/actions/settings';
import { closeSidebar } from 'pl-fe/actions/sidebar';
import { useAccount } from 'pl-fe/api/hooks';
import Account from 'pl-fe/components/account';
import { Stack, Divider, HStack, Icon, Text } from 'pl-fe/components/ui';
import ProfileStats from 'pl-fe/features/ui/components/profile-stats';
import { useAppDispatch, useAppSelector, useFeatures, useInstance } from 'pl-fe/hooks';
import { makeGetOtherAccounts } from 'pl-fe/selectors';
import sourceCode from 'pl-fe/utils/code';
import { isStandalone } from 'pl-fe/utils/state';

import type { List as ImmutableList } from 'immutable';
import type { Account as AccountEntity } from 'pl-fe/normalizers';

const messages = defineMessages({
  profile: { id: 'account.profile', defaultMessage: 'Profile' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  followedTags: { id: 'navigation_bar.followed_tags', defaultMessage: 'Followed hashtags' },
  logout: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
  profileDirectory: { id: 'navigation_bar.profile_directory', defaultMessage: 'Profile directory' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  groups: { id: 'column.groups', defaultMessage: 'Groups' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  developers: { id: 'navigation.developers', defaultMessage: 'Developers' },
  dashboard: { id: 'navigation.dashboard', defaultMessage: 'Dashboard' },
  scheduledStatuses: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  drafts: { id: 'navigation.drafts', defaultMessage: 'Drafts' },
  addAccount: { id: 'profile_dropdown.add_account', defaultMessage: 'Add an existing account' },
  followRequests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  login: { id: 'account.login', defaultMessage: 'Log in' },
  register: { id: 'account.register', defaultMessage: 'Sign up' },
  sourceCode: { id: 'navigation.source_code', defaultMessage: 'Source code' },
  conversations: { id: 'navigation.direct_messages', defaultMessage: 'Direct messages' },
});

interface ISidebarLink {
  href?: string;
  to?: string;
  icon: string;
  text: string | JSX.Element;
  onClick: React.EventHandler<React.MouseEvent>;
}

const SidebarLink: React.FC<ISidebarLink> = ({ href, to, icon, text, onClick }) => {
  const body = (
    <HStack space={2} alignItems='center'>
      <div className='relative inline-flex rounded-full bg-primary-50 p-2 dark:bg-gray-800'>
        <Icon src={icon} className='h-5 w-5 text-primary-500' />
      </div>

      <Text tag='span' weight='medium' theme='inherit'>{text}</Text>
    </HStack>
  );

  if (to) {
    return (
      <NavLink className='group rounded-full text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800' to={to} onClick={onClick}>
        {body}
      </NavLink>
    );
  }

  return (
    <a className='group rounded-full text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800' href={href} target='_blank' onClick={onClick}>
      {body}
    </a>
  );
};

const SidebarMenu: React.FC = (): JSX.Element | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getOtherAccounts = useCallback(makeGetOtherAccounts(), []);
  const features = useFeatures();
  const me = useAppSelector((state) => state.me);
  const { account } = useAccount(me || undefined);
  const otherAccounts: ImmutableList<AccountEntity> = useAppSelector((state) => getOtherAccounts(state));
  const sidebarOpen = useAppSelector((state) => state.sidebar.sidebarOpen);
  const settings = useAppSelector((state) => getSettings(state));
  const followRequestsCount = useAppSelector((state) => state.user_lists.follow_requests.items.count());
  const scheduledStatusCount = useAppSelector((state) => state.scheduled_statuses.size);
  const draftCount = useAppSelector((state) => state.draft_statuses.size);
  // const dashboardCount = useAppSelector((state) => state.admin.openReports.count() + state.admin.awaitingApproval.count());
  const [sidebarVisible, setSidebarVisible] = useState(sidebarOpen);
  const touchStart = useRef(0);
  const touchEnd = useRef<number | null>(null);
  const standalone = useAppSelector(isStandalone);

  const instance = useInstance();
  const restrictUnauth = instance.pleroma.metadata.restrict_unauthenticated;

  const containerRef = React.useRef<HTMLDivElement>(null);

  const [switcher, setSwitcher] = React.useState(false);

  const onClose = () => dispatch(closeSidebar());

  const handleClose = () => {
    setSwitcher(false);
    onClose();
  };

  const handleSwitchAccount = (account: AccountEntity): React.MouseEventHandler => (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(switchAccount(account.id));
  };

  const onClickLogOut: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(logOut());
  };

  const handleSwitcherClick: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setSwitcher((prevState) => (!prevState));
  };

  const renderAccount = (account: AccountEntity) => (
    <a href='#' className='block py-2' onClick={handleSwitchAccount(account)} key={account.id}>
      <div className='pointer-events-none'>
        <Account account={account} showProfileHoverCard={false} withRelationship={false} withLinkToProfile={false} />
      </div>
    </a>
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') handleClose();
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => touchStart.current = e.targetTouches[0].clientX;
  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => touchEnd.current = e.targetTouches[0].clientX;

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchEnd.current !== null && touchStart.current - touchEnd.current > 100) {
      handleClose();
    }
    touchEnd.current = null;
  };

  useEffect(() => {
    dispatch(fetchOwnAccounts());
  }, []);

  useEffect(() => {
    if (sidebarOpen) containerRef.current?.querySelector('a')?.focus();
    setTimeout(() => setSidebarVisible(sidebarOpen), sidebarOpen ? 0 : 150);
  }, [sidebarOpen]);

  return (
    <div
      aria-expanded={sidebarOpen}
      className={
        clsx({
          'z-[1000]': sidebarOpen || sidebarVisible,
          hidden: !(sidebarOpen || sidebarVisible),
        })
      }
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={clsx('fixed inset-0 cursor-default bg-gray-500 black:bg-gray-900 no-reduce-motion:transition-opacity dark:bg-gray-700', {
          'opacity-0': !(sidebarVisible && sidebarOpen),
          'opacity-40': (sidebarVisible && sidebarOpen),
        })}
        role='button'
        onClick={handleClose}
      />

      <div
        className={
          clsx('fixed bottom-[60px] left-2 z-[1000] flex max-h-[calc(100dvh-68px)] w-full max-w-xs flex-1 origin-bottom-left flex-col overflow-hidden rounded-xl bg-white shadow-lg ease-in-out black:bg-black no-reduce-motion:transition-transform rtl:right-2 rtl:origin-bottom-right dark:border dark:border-gray-800 dark:bg-primary-900 dark:shadow-none', {
            'scale-100': sidebarVisible && sidebarOpen,
            'scale-0': !(sidebarVisible && sidebarOpen),
          })
        }
      >
        <div className='relative h-full w-full overflow-auto'>
          <div className='p-4'>
            {account ? (
              <Stack space={4}>
                <Link to={`/@${account.acct}`} onClick={onClose}>
                  <Account account={account} showProfileHoverCard={false} withLinkToProfile={false} />
                </Link>

                <ProfileStats
                  account={account}
                  onClickHandler={handleClose}
                />

                <Stack space={4}>
                  <Divider />

                  <SidebarLink
                    to={`/@${account.acct}`}
                    icon={require('@tabler/icons/outline/user.svg')}
                    text={intl.formatMessage(messages.profile)}
                    onClick={onClose}
                  />

                  {(account.locked || followRequestsCount > 0) && (
                    <SidebarLink
                      to='/follow_requests'
                      icon={require('@tabler/icons/outline/user-plus.svg')}
                      text={intl.formatMessage(messages.followRequests)}
                      onClick={onClose}
                    />
                  )}

                  {features.conversations && (
                    <SidebarLink
                      to='/conversations'
                      icon={require('@tabler/icons/outline/mail.svg')}
                      text={intl.formatMessage(messages.conversations)}
                      onClick={onClose}
                    />
                  )}

                  {features.bookmarks && (
                    <SidebarLink
                      to='/bookmarks'
                      icon={require('@tabler/icons/outline/bookmark.svg')}
                      text={intl.formatMessage(messages.bookmarks)}
                      onClick={onClose}
                    />
                  )}

                  {features.groups && (
                    <SidebarLink
                      to='/groups'
                      icon={require('@tabler/icons/outline/circles.svg')}
                      text={intl.formatMessage(messages.groups)}
                      onClick={onClose}
                    />
                  )}

                  {features.lists && (
                    <SidebarLink
                      to='/lists'
                      icon={require('@tabler/icons/outline/list.svg')}
                      text={intl.formatMessage(messages.lists)}
                      onClick={onClose}
                    />
                  )}

                  {features.events && (
                    <SidebarLink
                      to='/events'
                      icon={require('@tabler/icons/outline/calendar-event.svg')}
                      text={intl.formatMessage(messages.events)}
                      onClick={onClose}
                    />
                  )}

                  {features.profileDirectory && (
                    <SidebarLink
                      to='/directory'
                      icon={require('@tabler/icons/outline/address-book.svg')}
                      text={intl.formatMessage(messages.profileDirectory)}
                      onClick={onClose}
                    />
                  )}

                  {scheduledStatusCount > 0 && (
                    <SidebarLink
                      to='/scheduled_statuses'
                      icon={require('@tabler/icons/outline/calendar-stats.svg')}
                      text={intl.formatMessage(messages.scheduledStatuses)}
                      onClick={onClose}
                    />
                  )}

                  {draftCount > 0 && (
                    <SidebarLink
                      to='/draft_statuses'
                      icon={require('@tabler/icons/outline/notes.svg')}
                      text={intl.formatMessage(messages.drafts)}
                      onClick={onClose}
                    />
                  )}

                  {features.publicTimeline && <>
                    <Divider />

                    <SidebarLink
                      to='/timeline/local'
                      icon={features.federating ? require('@tabler/icons/outline/affiliate.svg') : require('@tabler/icons/outline/world.svg')}
                      text={features.federating ? <FormattedMessage id='tabs_bar.local' defaultMessage='Local' /> : <FormattedMessage id='tabs_bar.all' defaultMessage='All' />}
                      onClick={onClose}
                    />

                    {features.bubbleTimeline && (
                      <SidebarLink
                        to='/timeline/bubble'
                        icon={require('@tabler/icons/outline/chart-bubble.svg')}
                        text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
                        onClick={onClose}
                      />
                    )}

                    {features.federating && (
                      <SidebarLink
                        to='/timeline/fediverse'
                        icon={require('@tabler/icons/outline/topology-star-ring-3.svg')}
                        text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
                        onClick={onClose}
                      />
                    )}
                  </>}

                  <Divider />

                  <SidebarLink
                    to='/settings/preferences'
                    icon={require('@tabler/icons/outline/settings.svg')}
                    text={intl.formatMessage(messages.preferences)}
                    onClick={onClose}
                  />

                  {features.followedHashtagsList && (
                    <SidebarLink
                      to='/followed_tags'
                      icon={require('@tabler/icons/outline/hash.svg')}
                      text={intl.formatMessage(messages.followedTags)}
                      onClick={onClose}
                    />
                  )}

                  {settings.get('isDeveloper') && (
                    <SidebarLink
                      to='/developers'
                      icon={require('@tabler/icons/outline/code.svg')}
                      text={intl.formatMessage(messages.developers)}
                      onClick={onClose}
                    />
                  )}

                  {(account.is_admin || account.is_moderator) && (
                    <SidebarLink
                      to='/admin'
                      icon={require('@tabler/icons/outline/dashboard.svg')}
                      text={intl.formatMessage(messages.dashboard)}
                      onClick={onClose}
                      // count={dashboardCount} WIP
                    />
                  )}

                  <Divider />

                  <SidebarLink
                    to='/logout'
                    icon={require('@tabler/icons/outline/logout.svg')}
                    text={intl.formatMessage(messages.logout)}
                    onClick={onClickLogOut}
                  />

                  <Divider />

                  <SidebarLink
                    href={sourceCode.url}
                    icon={require('@tabler/icons/outline/code.svg')}
                    text={intl.formatMessage(messages.sourceCode)}
                    onClick={onClose}
                  />

                  <Divider />

                  <Stack space={4}>
                    <button type='button' onClick={handleSwitcherClick} className='py-1'>
                      <HStack alignItems='center' justifyContent='between'>
                        <Text tag='span'>
                          <FormattedMessage id='profile_dropdown.switch_account' defaultMessage='Switch accounts' />
                        </Text>

                        <Icon
                          src={require('@tabler/icons/outline/chevron-down.svg')}
                          className={clsx('h-4 w-4 text-gray-900 transition-transform dark:text-gray-100', {
                            'rotate-180': switcher,
                          })}
                        />
                      </HStack>
                    </button>

                    {switcher && (
                      <div className='border-t-2 border-solid border-gray-100 black:border-t dark:border-gray-800'>
                        {otherAccounts.map(account => renderAccount(account))}

                        <NavLink className='flex items-center space-x-1 py-2' to='/login/add' onClick={handleClose}>
                          <Icon className='h-4 w-4 text-primary-500' src={require('@tabler/icons/outline/plus.svg')} />
                          <Text size='sm' weight='medium'>{intl.formatMessage(messages.addAccount)}</Text>
                        </NavLink>
                      </div>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              <Stack space={4}>
                {features.publicTimeline && !restrictUnauth.timelines.local && <>
                  <SidebarLink
                    to='/timeline/local'
                    icon={features.federating ? require('@tabler/icons/outline/affiliate.svg') : require('@tabler/icons/outline/world.svg')}
                    text={features.federating ? <FormattedMessage id='tabs_bar.local' defaultMessage='Local' /> : <FormattedMessage id='tabs_bar.all' defaultMessage='All' />}
                    onClick={onClose}
                  />

                  {features.bubbleTimeline && !restrictUnauth.timelines.bubble && (
                    <SidebarLink
                      to='/timeline/bubble'
                      icon={require('@tabler/icons/outline/chart-bubble.svg')}
                      text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
                      onClick={onClose}
                    />
                  )}

                  {features.federating && !restrictUnauth.timelines.federated && (
                    <SidebarLink
                      to='/timeline/fediverse'
                      icon={require('@tabler/icons/outline/topology-star-ring-3.svg')}
                      text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
                      onClick={onClose}
                    />
                  )}

                  <Divider />
                </>}

                <SidebarLink
                  to='/login'
                  icon={require('@tabler/icons/outline/login.svg')}
                  text={intl.formatMessage(messages.login)}
                  onClick={onClose}
                />

                {!standalone && (
                  <SidebarLink
                    to='/signup'
                    icon={require('@tabler/icons/outline/user-plus.svg')}
                    text={intl.formatMessage(messages.register)}
                    onClick={onClose}
                  />
                )}

                <Divider />

                <SidebarLink
                  href={sourceCode.url}
                  icon={require('@tabler/icons/outline/code.svg')}
                  text={intl.formatMessage(messages.sourceCode)}
                  onClick={onClose}
                />
              </Stack>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { SidebarMenu as default };

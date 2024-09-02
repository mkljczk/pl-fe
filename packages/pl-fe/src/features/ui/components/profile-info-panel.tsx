import parse, { Element, type HTMLReactParserOptions, domToReact, type DOMNode } from 'html-react-parser';
import React, { useMemo } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Badge from 'pl-fe/components/badge';
import HashtagLink from 'pl-fe/components/hashtag-link';
import Markup from 'pl-fe/components/markup';
import { dateFormatOptions } from 'pl-fe/components/relative-timestamp';
import Scrobble from 'pl-fe/components/scrobble';
import StatusMention from 'pl-fe/components/status-mention';
import { Icon, HStack, Stack, Text } from 'pl-fe/components/ui';
import { useAppSelector, usePlFeConfig } from 'pl-fe/hooks';
import { capitalize } from 'pl-fe/utils/strings';

import ProfileFamiliarFollowers from './profile-familiar-followers';
import ProfileField from './profile-field';
import ProfileStats from './profile-stats';

import type { Scrobble as ScrobbleEntity } from 'pl-api';
import type { Account } from 'pl-fe/normalizers';

const messages = defineMessages({
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
  account_locked: { id: 'account.locked_info', defaultMessage: 'This account privacy status is set to locked. The owner manually reviews who can follow them.' },
  deactivated: { id: 'account.deactivated', defaultMessage: 'Deactivated' },
  bot: { id: 'account.badges.bot', defaultMessage: 'Bot' },
});

interface IProfileInfoPanel {
  account?: Account & { scrobble?: ScrobbleEntity };
  /** Username from URL params, in case the account isn't found. */
  username: string;
}

/** User profile metadata, such as location, birthday, etc. */
const ProfileInfoPanel: React.FC<IProfileInfoPanel> = ({ account, username }) => {
  const intl = useIntl();
  const { displayFqn } = usePlFeConfig();
  const me = useAppSelector(state => state.me);
  const ownAccount = account?.id === me;

  const getStaffBadge = (): React.ReactNode => {
    if (account?.is_admin) {
      return <Badge slug='admin' title={<FormattedMessage id='account_moderation_modal.roles.admin' defaultMessage='Admin' />} key='staff' />;
    } else if (account?.is_moderator) {
      return <Badge slug='moderator' title={<FormattedMessage id='account_moderation_modal.roles.moderator' defaultMessage='Moderator' />} key='staff' />;
    } else {
      return null;
    }
  };

  const getCustomBadges = (): React.ReactNode[] => {
    const badges = account?.roles || [];

    return badges.filter(badge => badge.highlighted).map(badge => (
      <Badge
        key={badge.id || badge.name}
        slug={badge.name}
        title={capitalize(badge.name)}
        color={badge.color}
      />
    ));
  };

  const getBadges = (): React.ReactNode[] => {
    const custom = getCustomBadges();
    const staffBadge = getStaffBadge();

    const badges = [];

    if (staffBadge) {
      badges.push(staffBadge);
    }

    return [...badges, ...custom];
  };

  const renderBirthday = (): React.ReactNode => {
    const birthday = account?.birthday;
    if (!birthday) return null;

    const formattedBirthday = intl.formatDate(birthday, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

    const date = new Date(birthday);
    const today = new Date();

    const hasBirthday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();

    return (
      <HStack alignItems='center' space={0.5}>
        <Icon
          src={require('@tabler/icons/outline/balloon.svg')}
          className='h-4 w-4 text-gray-800 dark:text-gray-200'
        />

        <Text size='sm'>
          {hasBirthday ? (
            <FormattedMessage id='account.birthday_today' defaultMessage='Birthday is today!' />
          ) : (
            <FormattedMessage id='account.birthday' defaultMessage='Born {date}' values={{ date: formattedBirthday }} />
          )}
        </Text>
      </HStack>
    );
  };

  const note = useMemo(() => {
    if (!account) return false;

    const options: HTMLReactParserOptions = {
      replace(domNode) {
        if (domNode instanceof Element && ['script', 'iframe'].includes(domNode.name)) {
          return null;
        }

        if (domNode instanceof Element && domNode.name === 'a') {
          const classes = domNode.attribs.class?.split(' ');
          const id = domNode.attribs['data-user'];

          const fallback = (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <a
              {...domNode.attribs}
              onClick={(e) => e.stopPropagation()}
              rel='nofollow noopener'
              target='_blank'
              title={domNode.attribs.href}
            >
              {domToReact(domNode.children as DOMNode[], options)}
            </a>
          );

          if (classes?.includes('mention') && id) {
            return (
              <StatusMention accountId={id} fallback={fallback} />
            );
          }

          if (classes?.includes('hashtag')) {
            const child = domToReact(domNode.children as DOMNode[]);
            const hashtag = typeof child === 'string' ? child.replace(/^#/, '') : undefined;
            if (hashtag) {
              return <HashtagLink hashtag={hashtag} />;
            }
          }

          return fallback;
        }
      },
    };

    return !!account.note.length && parse(account.note_emojified, options);
  }, [account?.note_emojified]);

  if (!account) {
    return (
      <div className='mt-6 min-w-0 flex-1 sm:px-2'>
        <Stack space={2}>
          <Stack>
            <HStack space={1} alignItems='center'>
              <Text size='sm' theme='muted' direction='ltr' truncate>
                @{username}
              </Text>
            </HStack>
          </Stack>
        </Stack>
      </div>
    );
  }

  const deactivated = account.deactivated ?? false;
  const displayNameHtml = deactivated ? { __html: intl.formatMessage(messages.deactivated) } : { __html: account.display_name_html };
  const memberSinceDate = intl.formatDate(account.created_at, { month: 'long', year: 'numeric' });
  const badges = getBadges();

  return (
    <div className='mt-6 min-w-0 flex-1 sm:px-2'>
      <Stack space={2}>
        <Stack>
          <HStack space={1} alignItems='center'>
            <Text size='lg' weight='bold' dangerouslySetInnerHTML={displayNameHtml} truncate />

            {account.bot && <Badge slug='bot' title={intl.formatMessage(messages.bot)} />}

            {badges.length > 0 && (
              <HStack space={1} alignItems='center'>
                {badges}
              </HStack>
            )}
          </HStack>

          <HStack alignItems='center' space={0.5}>
            <Text size='sm' theme='muted' direction='ltr' truncate>
              @{displayFqn ? account.fqn : account.acct}
            </Text>

            {account.locked && (
              <Icon
                src={require('@tabler/icons/outline/lock.svg')}
                alt={intl.formatMessage(messages.account_locked)}
                className='h-4 w-4 text-gray-600'
              />
            )}
          </HStack>
        </Stack>

        <ProfileStats account={account} />

        {note && (
          <Markup size='sm'>{note}</Markup>
        )}

        <div className='flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center'>
          {account.local ? (
            <HStack alignItems='center' space={0.5}>
              <Icon
                src={require('@tabler/icons/outline/calendar.svg')}
                className='h-4 w-4 text-gray-800 dark:text-gray-200'
              />

              <Text size='sm' title={intl.formatDate(account.created_at, dateFormatOptions)}>
                <FormattedMessage
                  id='account.member_since' defaultMessage='Joined {date}' values={{
                    date: memberSinceDate,
                  }}
                />
              </Text>
            </HStack>
          ) : null}

          {account.location ? (
            <HStack alignItems='center' space={0.5}>
              <Icon
                src={require('@tabler/icons/outline/map-pin.svg')}
                className='h-4 w-4 text-gray-800 dark:text-gray-200'
              />

              <Text size='sm'>
                {account.location}
              </Text>
            </HStack>
          ) : null}

          {renderBirthday()}
        </div>

        {account.scrobble && <Scrobble scrobble={account.scrobble} />}

        {ownAccount ? null : <ProfileFamiliarFollowers account={account} />}
      </Stack>

      {account.fields.length > 0 && (
        <Stack space={2} className='mt-4 xl:hidden'>
          {account.fields.map((field, i) => (
            <ProfileField field={field} key={i} />
          ))}
        </Stack>
      )}
    </div>
  );
};

export { ProfileInfoPanel as default };

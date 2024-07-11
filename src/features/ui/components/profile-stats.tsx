import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { HStack, Text } from 'soapbox/components/ui';
import { useSettings } from 'soapbox/hooks';
import { shortNumberFormat } from 'soapbox/utils/numbers';

import type { Account } from 'soapbox/schemas';

const messages = defineMessages({
  followers: { id: 'account.followers', defaultMessage: 'Followers' },
  follows: { id: 'account.follows', defaultMessage: 'Following' },
  statuses: { id: 'account.statuses', defaultMessage: 'Statuses' },
});

interface IProfileStats {
  account: Pick<Account, 'acct' | 'followers_count' | 'following_count' | 'statuses_count'> | undefined;
  onClickHandler?: React.MouseEventHandler;
}

/** Display follower and following counts for an account. */
const ProfileStats: React.FC<IProfileStats> = ({ account, onClickHandler }) => {
  const intl = useIntl();
  const { demetricator } = useSettings();

  if (!account) {
    return null;
  }

  return (
    <HStack alignItems='center' className='gap-x-3' wrap>
      <HStack alignItems='center' space={1}>
        <Text theme='primary' weight='bold' size='sm'>
          {shortNumberFormat(account.statuses_count)}
        </Text>
        <Text weight='bold' size='sm'>
          {intl.formatMessage(messages.statuses)}
        </Text>
      </HStack>

      <NavLink to={`/@${account.acct}/followers`} onClick={onClickHandler} title={intl.formatNumber(account.followers_count)} className='hover:underline'>
        <HStack alignItems='center' space={1}>
          {!demetricator && (
            <Text theme='primary' weight='bold' size='sm'>
              {shortNumberFormat(account.followers_count)}
            </Text>
          )}
          <Text weight='bold' size='sm'>
            {intl.formatMessage(messages.followers)}
          </Text>
        </HStack>
      </NavLink>

      <NavLink to={`/@${account.acct}/following`} onClick={onClickHandler} title={intl.formatNumber(account.following_count)} className='hover:underline'>
        <HStack alignItems='center' space={1}>
          {!demetricator && (
            <Text theme='primary' weight='bold' size='sm'>
              {shortNumberFormat(account.following_count)}
            </Text>
          )}
          <Text weight='bold' size='sm'>
            {intl.formatMessage(messages.follows)}
          </Text>
        </HStack>
      </NavLink>
    </HStack>
  );
};

export { ProfileStats as default };

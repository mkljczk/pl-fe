import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import React, { useEffect } from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchAccountFamiliarFollowers } from 'pl-fe/actions/familiar-followers';
import { openModal } from 'pl-fe/actions/modals';
import AvatarStack from 'pl-fe/components/avatar-stack';
import HoverRefWrapper from 'pl-fe/components/hover-ref-wrapper';
import { HStack, Text } from 'pl-fe/components/ui';
import VerificationBadge from 'pl-fe/components/verification-badge';
import { useAppDispatch, useAppSelector, useFeatures } from 'pl-fe/hooks';
import { makeGetAccount } from 'pl-fe/selectors';

import type { Account } from 'pl-fe/normalizers';

const getAccount = makeGetAccount();

interface IProfileFamiliarFollowers {
  account: Account;
}

const ProfileFamiliarFollowers: React.FC<IProfileFamiliarFollowers> = ({ account }) => {
  const dispatch = useAppDispatch();
  const me = useAppSelector((state) => state.me);
  const features = useFeatures();
  const familiarFollowerIds = useAppSelector(state => state.user_lists.familiar_followers.get(account.id)?.items || ImmutableOrderedSet<string>());
  const familiarFollowers: ImmutableOrderedSet<Account | null> = useAppSelector(state => familiarFollowerIds.slice(0, 2).map(accountId => getAccount(state, accountId)));

  useEffect(() => {
    if (me && features.familiarFollowers) {
      dispatch(fetchAccountFamiliarFollowers(account.id));
    }
  }, [account.id]);

  const openFamiliarFollowersModal = () => {
    dispatch(openModal('FAMILIAR_FOLLOWERS', {
      accountId: account.id,
    }));
  };

  if (familiarFollowerIds.size === 0) {
    return null;
  }

  const accounts: Array<React.ReactNode> = familiarFollowers.map(account => !!account && (
    <HoverRefWrapper accountId={account.id} key={account.id} inline>
      <Link className='mention inline-block' to={`/@${account.acct}`}>
        <HStack space={1} alignItems='center' grow>
          <Text
            size='sm'
            theme='primary'
            truncate
            dangerouslySetInnerHTML={{ __html: account.display_name_html }}
          />

          {account.verified && <VerificationBadge />}
        </HStack>
      </Link>
    </HoverRefWrapper>
  )).toArray().filter(Boolean);

  if (familiarFollowerIds.size > 2) {
    accounts.push(
      <span key='_' className='cursor-pointer hover:underline' role='presentation' onClick={openFamiliarFollowersModal}>
        <FormattedMessage
          id='account.familiar_followers.more'
          defaultMessage='{count, plural, one {# other} other {# others}} you follow'
          values={{ count: familiarFollowerIds.size - familiarFollowers.size }}
        />
      </span>,
    );
  }

  return (
    <HStack space={2} alignItems='center'>
      <AvatarStack accountIds={familiarFollowerIds} />
      <Text theme='muted' size='sm' tag='div'>
        <FormattedMessage
          id='account.familiar_followers'
          defaultMessage='Followed by {accounts}'
          values={{
            accounts: <FormattedList type='conjunction' value={accounts} />,
          }}
        />
      </Text>
    </HStack>
  );
};

export { ProfileFamiliarFollowers as default };

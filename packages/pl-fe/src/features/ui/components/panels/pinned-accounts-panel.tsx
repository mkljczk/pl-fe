import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchPinnedAccounts } from 'pl-fe/actions/accounts';
import Widget from 'pl-fe/components/ui/widget';
import AccountContainer from 'pl-fe/containers/account-container';
import { WhoToFollowPanel } from 'pl-fe/features/ui/util/async-components';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

import type { Account } from 'pl-fe/normalizers';

interface IPinnedAccountsPanel {
  account: Pick<Account, 'id' | 'display_name_html'>;
  limit: number;
}

const PinnedAccountsPanel: React.FC<IPinnedAccountsPanel> = ({ account, limit }) => {
  const dispatch = useAppDispatch();
  const pinned = useAppSelector((state) => state.user_lists.pinned.get(account.id)?.items || ImmutableOrderedSet<string>()).slice(0, limit);

  useEffect(() => {
    dispatch(fetchPinnedAccounts(account.id));
  }, []);

  if (pinned.isEmpty()) {
    return (
      <WhoToFollowPanel limit={limit} />
    );
  }

  return (
    <Widget
      title={<FormattedMessage
        id='pinned_accounts.title'
        defaultMessage='{name}’s choices'
        values={{
          name: <span dangerouslySetInnerHTML={{ __html: account.display_name_html }} />,
        }}
      />}
    >
      {pinned && pinned.map((suggestion) => (
        <AccountContainer
          key={suggestion}
          id={suggestion}
          withRelationship={false}
        />
      ))}
    </Widget>
  );
};

export { PinnedAccountsPanel as default };

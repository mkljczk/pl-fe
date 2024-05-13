import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchUsers } from 'soapbox/actions/admin';
import { Widget } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  title: { id: 'admin.latest_accounts_panel.title', defaultMessage: 'Latest Accounts' },
  expand: { id: 'admin.latest_accounts_panel.more', defaultMessage: 'Click to see {count, plural, one {# account} other {# accounts}}' },
});

interface ILatestAccountsPanel {
  limit?: number;
}

const LatestAccountsPanel: React.FC<ILatestAccountsPanel> = ({ limit = 5 }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const accountIds = useAppSelector<ImmutableOrderedSet<string>>((state) => state.admin.get('latestUsers').take(limit));

  const [total, setTotal] = useState(accountIds.size);

  useEffect(() => {
    dispatch(fetchUsers(['local', 'active'], 1, null, limit))
      .then((value) => {
        setTotal((value as { count: number }).count);
      })
      .catch(() => {});
  }, []);

  const handleAction = () => {
    history.push('/soapbox/admin/users');
  };

  return (
    <Widget
      title={intl.formatMessage(messages.title)}
      onActionClick={handleAction}
      actionTitle={intl.formatMessage(messages.expand, { count: total })}
    >
      {accountIds.take(limit).map((account) => (
        <AccountContainer key={account} id={account} withRelationship={false} withDate />
      ))}
    </Widget>
  );
};

export { LatestAccountsPanel as default };

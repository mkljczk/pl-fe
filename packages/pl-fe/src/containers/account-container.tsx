import React from 'react';

import { useAccount } from 'pl-fe/api/hooks/accounts/useAccount';
import Account, { IAccount } from 'pl-fe/components/account';

interface IAccountContainer extends Omit<IAccount, 'account'> {
  id: string;
  withRelationship?: boolean;
}

const AccountContainer: React.FC<IAccountContainer> = ({ id, withRelationship, ...props }) => {
  const { account } = useAccount(id, { withRelationship });

  return (
    <Account account={account!} withRelationship={withRelationship} {...props} />
  );
};

export { AccountContainer as default };

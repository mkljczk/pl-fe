import React from 'react';

import { useAccount } from 'soapbox/api/hooks';
import Account from 'soapbox/components/account';

interface IAutosuggestAccount {
  id: string;
}

const AutosuggestAccount: React.FC<IAutosuggestAccount> = ({ id }) => {
  const { account } = useAccount(id);
  if (!account) return null;

  return (
    <div className='snap-start snap-always'>
      <Account account={account} hideActions showProfileHoverCard={false} />
    </div>
  );

};

export { AutosuggestAccount as default };

import React from 'react';
import { Link } from 'react-router-dom';

import { useAccount } from 'pl-fe/api/hooks';

import HoverRefWrapper from './hover-ref-wrapper';

interface IStatusMention {
  accountId: string;
  fallback?: JSX.Element;
}

const StatusMention: React.FC<IStatusMention> = ({ accountId, fallback }) => {
  const { account } = useAccount(accountId);

  if (!account) return (
    <HoverRefWrapper accountId={accountId} inline>
      {fallback}
    </HoverRefWrapper>
  );

  return (
    <HoverRefWrapper accountId={accountId} inline>
      <Link
        to={`/@${account.acct}`}
        className='text-primary-600 hover:underline dark:text-accent-blue'
        dir='ltr'
        onClick={(e) => e.stopPropagation()}
      >
        @{account.acct}
      </Link>
    </HoverRefWrapper>
  );
};

export { StatusMention as default };

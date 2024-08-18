import { accountSchema, type Account as BaseAccount } from 'pl-api';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntityLookup } from 'soapbox/entity-store/hooks';
import { useClient, useFeatures, useLoggedIn } from 'soapbox/hooks';
import { type Account, normalizeAccount } from 'soapbox/normalizers';

import { useRelationship } from './useRelationship';

interface UseAccountLookupOpts {
  withRelationship?: boolean;
}

const useAccountLookup = (acct: string | undefined, opts: UseAccountLookupOpts = {}) => {
  const client = useClient();
  const features = useFeatures();
  const history = useHistory();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity: account, isUnauthorized, ...result } = useEntityLookup<BaseAccount, Account>(
    Entities.ACCOUNTS,
    (account) => account.acct.toLowerCase() === acct?.toLowerCase(),
    () => client.accounts.lookupAccount(acct!),
    { schema: accountSchema, enabled: !!acct, transform: normalizeAccount },
  );

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(account?.id, { enabled: withRelationship });

  const isBlocked = account?.relationship?.blocked_by === true;
  const isUnavailable = (me === account?.id) ? false : (isBlocked && !features.blockersVisible);

  useEffect(() => {
    if (isUnauthorized) {
      history.push('/login');
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    isUnauthorized,
    isUnavailable,
    account: account ? { ...account, relationship } : undefined,
  };
};

export { useAccountLookup };
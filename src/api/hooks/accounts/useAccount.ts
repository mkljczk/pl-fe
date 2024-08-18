import { type Account as BaseAccount, accountSchema } from 'pl-api';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useAppSelector, useClient, useFeatures, useLoggedIn } from 'soapbox/hooks';
import { type Account, normalizeAccount } from 'soapbox/normalizers';

import { useRelationship } from './useRelationship';

interface UseAccountOpts {
  withRelationship?: boolean;
}

const useAccount = (accountId?: string, opts: UseAccountOpts = {}) => {
  const client = useClient();
  const history = useHistory();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity, isUnauthorized, ...result } = useEntity<BaseAccount, Account>(
    [Entities.ACCOUNTS, accountId!],
    () => client.accounts.getAccount(accountId!),
    { schema: accountSchema, enabled: !!accountId, transform: normalizeAccount },
  );

  const meta = useAppSelector((state) => accountId && state.accounts_meta[accountId] || {});

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(accountId, { enabled: withRelationship });

  const isBlocked = entity?.relationship?.blocked_by === true;
  const isUnavailable = (me === entity?.id) ? false : (isBlocked && !features.blockersVisible);

  const account = useMemo(
    () => entity ? { ...entity, relationship, __meta: { meta, ...entity.__meta } } : undefined,
    [entity, relationship],
  );

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
    account,
  };
};

export { useAccount };
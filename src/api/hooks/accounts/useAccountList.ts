import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { Account, accountSchema } from 'soapbox/schemas';

import { useRelationships } from './useRelationships';

import type { EntityFn } from 'soapbox/entity-store/hooks/types';

interface useAccountListOpts {
  enabled?: boolean;
}

const useAccountList = (listKey: string[], entityFn: EntityFn<void>, opts: useAccountListOpts = {}) => {
  const { entities, ...rest } = useEntities(
    [Entities.ACCOUNTS, ...listKey],
    entityFn,
    { schema: accountSchema, enabled: opts.enabled },
  );

  const { relationships } = useRelationships(
    listKey,
    entities.map(({ id }) => id),
  );

  const accounts: Account[] = entities.map((account) => ({
    ...account,
    relationship: relationships[account.id],
  }));

  return { accounts, ...rest };
};

const useBlocks = () => {
  const client = useClient();
  return useAccountList(['blocks'], () => client.request('/api/v1/blocks'));
};

const useMutes = () => {
  const client = useClient();
  return useAccountList(['mutes'], () => client.request('/api/v1/mutes'));
};

const useFollowing = (accountId: string | undefined) => {
  const client = useClient();

  return useAccountList(
    [accountId!, 'following'],
    () => client.request(`/api/v1/accounts/${accountId}/following`),
    { enabled: !!accountId },
  );
};

const useFollowers = (accountId: string | undefined) => {
  const client = useClient();

  return useAccountList(
    [accountId!, 'followers'],
    () => client.request(`/api/v1/accounts/${accountId}/followers`),
    { enabled: !!accountId },
  );
};

export {
  useAccountList,
  useBlocks,
  useMutes,
  useFollowing,
  useFollowers,
};
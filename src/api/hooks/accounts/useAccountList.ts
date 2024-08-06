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
  return useAccountList(['blocks'], () => client.filtering.getBlocks());
};

const useMutes = () => {
  const client = useClient();
  return useAccountList(['mutes'], () => client.filtering.getMutes());
};

const useFollowing = (accountId: string | undefined) => {
  const client = useClient();

  return useAccountList(
    [accountId!, 'following'],
    () => client.accounts.getAccountFollowing(accountId!),
    { enabled: !!accountId },
  );
};

const useFollowers = (accountId: string | undefined) => {
  const client = useClient();

  return useAccountList(
    [accountId!, 'followers'],
    () => client.accounts.getAccountFollowers(accountId!),
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
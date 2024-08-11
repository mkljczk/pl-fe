import { useTransaction } from 'soapbox/entity-store/hooks';
import { EntityCallbacks } from 'soapbox/entity-store/hooks/types';
import { useClient, useGetState } from 'soapbox/hooks';
import { accountIdsToAccts } from 'soapbox/selectors';

import type { Account } from 'soapbox/normalizers';

const useSuggest = () => {
  const client = useClient();
  const getState = useGetState();
  const { transaction } = useTransaction();

  const suggestEffect = (accountIds: string[], suggested: boolean) => {
    const updater = (account: Account): Account => {
      account.is_suggested = suggested;
      return account;
    };

    transaction({
      Accounts: accountIds.reduce<Record<string, (account: Account) => Account>>(
        (result, id) => ({ ...result, [id]: updater }),
      {}),
    });
  };

  const suggest = async (accountIds: string[], callbacks?: EntityCallbacks<void, unknown>) => {
    const accts = accountIdsToAccts(getState(), accountIds);
    suggestEffect(accountIds, true);
    try {
      await client.request('/api/v1/pleroma/admin/users/suggest', {
        method: 'PATCH', body: { nicknames: accts },
      });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      suggestEffect(accountIds, false);
    }
  };

  const unsuggest = async (accountIds: string[], callbacks?: EntityCallbacks<void, unknown>) => {
    const accts = accountIdsToAccts(getState(), accountIds);
    suggestEffect(accountIds, false);
    try {
      await client.request('/api/v1/pleroma/admin/users/unsuggest', {
        method: 'PATCH', body: { nicknames: accts },
      });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      suggestEffect(accountIds, true);
    }
  };

  return {
    suggest,
    unsuggest,
  };
};

export { useSuggest };
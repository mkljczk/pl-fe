import { useTransaction } from 'soapbox/entity-store/hooks';
import { EntityCallbacks } from 'soapbox/entity-store/hooks/types';
import { useApi, useGetState } from 'soapbox/hooks';
import { accountIdsToAccts } from 'soapbox/selectors';

import type { Account } from 'soapbox/schemas';

const useSuggest = () => {
  const api = useApi();
  const getState = useGetState();
  const { transaction } = useTransaction();

  const suggestEffect = (accountIds: string[], suggested: boolean) => {
    const updater = (account: Account): Account => {
      if (account.pleroma) {
        account.pleroma.is_suggested = suggested;
      }
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
      await api('/api/v1/pleroma/admin/users/suggest', {
        method: 'PATCH',
        body: JSON.stringify({ nicknames: accts }),
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
      await api('/api/v1/pleroma/admin/users/unsuggest', {
        method: 'PATCH',
        body: JSON.stringify({ nicknames: accts }),
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
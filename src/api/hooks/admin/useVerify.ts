import { useTransaction } from 'soapbox/entity-store/hooks';
import { EntityCallbacks } from 'soapbox/entity-store/hooks/types';
import { useClient, useGetState } from 'soapbox/hooks';
import { accountIdsToAccts } from 'soapbox/selectors';

import type { Account } from 'soapbox/normalizers';

const useVerify = () => {
  const client = useClient();
  const getState = useGetState();
  const { transaction } = useTransaction();

  const verifyEffect = (accountIds: string[], verified: boolean) => {
    const updater = (account: Account): Account => {
      if (account.__meta.pleroma) {
        const tags = account.__meta.pleroma.tags.filter((tag: string) => tag !== 'verified');
        if (verified) {
          tags.push('verified');
        }
        account.__meta.pleroma.tags = tags;
      }
      account.verified = verified;
      return account;
    };

    transaction({
      Accounts: accountIds.reduce<Record<string, (account: Account) => Account>>(
        (result, id) => ({ ...result, [id]: updater }),
      {}),
    });
  };

  const verify = async (accountIds: string[], callbacks?: EntityCallbacks<void, unknown>) => {
    const accts = accountIdsToAccts(getState(), accountIds);
    verifyEffect(accountIds, true);
    try {
      await client.request('/api/v1/pleroma/admin/users/tag', {
        method: 'PUT',
        body: { nicknames: accts, tags: ['verified'] },
      });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      verifyEffect(accountIds, false);
    }
  };

  const unverify = async (accountIds: string[], callbacks?: EntityCallbacks<void, unknown>) => {
    const accts = accountIdsToAccts(getState(), accountIds);
    verifyEffect(accountIds, false);
    try {
      await client.request('/api/v1/pleroma/admin/users/tag', {
        method: 'DELETE',
        body: { nicknames: accts, tags: ['verified'] },
      });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      verifyEffect(accountIds, true);
    }
  };

  return {
    verify,
    unverify,
  };
};

export { useVerify };
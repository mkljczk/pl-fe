import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { useTransaction } from 'soapbox/entity-store/hooks';
import { useAppDispatch, useLoggedIn } from 'soapbox/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { relationshipSchema } from 'soapbox/schemas';

interface FollowOpts {
  reblogs?: boolean;
  notify?: boolean;
  languages?: string[];
}

const useFollow = () => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useLoggedIn();
  const { transaction } = useTransaction();

  const followEffect = (accountId: string) => {
    transaction({
      Accounts: {
        [accountId]: (account) => ({
          ...account,
          followers_count: account.followers_count + 1,
        }),
      },
      Relationships: {
        [accountId]: (relationship) => ({
          ...relationship,
          following: true,
        }),
      },
    });
  };

  const unfollowEffect = (accountId: string) => {
    transaction({
      Accounts: {
        [accountId]: (account) => ({
          ...account,
          followers_count: Math.max(0, account.followers_count - 1),
        }),
      },
      Relationships: {
        [accountId]: (relationship) => ({
          ...relationship,
          following: false,
        }),
      },
    });
  };

  const follow = async (accountId: string, options: FollowOpts = {}) => {
    if (!isLoggedIn) return;
    followEffect(accountId);

    try {
      const response = await api(`/api/v1/accounts/${accountId}/follow`, {
        method: 'POST',
        body: JSON.stringify(options),
      });
      const result = relationshipSchema.safeParse(response.json);
      if (result.success) {
        dispatch(importEntities([result.data], Entities.RELATIONSHIPS));
      }
    } catch (e) {
      unfollowEffect(accountId);
    }
  };

  const unfollow = async (accountId: string) => {
    if (!isLoggedIn) return;
    unfollowEffect(accountId);

    try {
      await api(`/api/v1/accounts/${accountId}/unfollow`, { method: 'POST' });
    } catch (e) {
      followEffect(accountId);
    }
  };

  return {
    follow,
    unfollow,
    followEffect,
    unfollowEffect,
  };
};

export { useFollow };
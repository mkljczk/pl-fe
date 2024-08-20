import { useMutation } from '@tanstack/react-query';

import { fetchRelationshipsFail, fetchRelationshipsSuccess } from 'soapbox/actions/accounts';
import { useAppDispatch, useClient } from 'soapbox/hooks';

const useFetchRelationships = () => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ accountIds }: { accountIds: string[]}) => {
      return client.accounts.getRelationships(accountIds);
    },
    onSuccess(response) {
      dispatch(fetchRelationshipsSuccess(response));
    },
    onError(error) {
      dispatch(fetchRelationshipsFail(error));
    },
  });
};

export { useFetchRelationships };

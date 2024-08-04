import { useMutation } from '@tanstack/react-query';

import { fetchRelationshipsFail, fetchRelationshipsSuccess } from 'soapbox/actions/accounts';
import { useAppDispatch, useClient } from 'soapbox/hooks';

const useFetchRelationships = () => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ accountIds }: { accountIds: string[]}) => {
      const ids = accountIds.map((id) => `id[]=${id}`).join('&');

      return client.request(`/api/v1/accounts/relationships?${ids}`);
    },
    onSuccess(response) {
      dispatch(fetchRelationshipsSuccess(response.json));
    },
    onError(error) {
      dispatch(fetchRelationshipsFail(error));
    },
  });
};

export { useFetchRelationships };
import { useMutation } from '@tanstack/react-query';

import { fetchRelationshipsFail, fetchRelationshipsSuccess } from 'soapbox/actions/accounts';
import { useApi, useAppDispatch } from 'soapbox/hooks';

const useFetchRelationships = () => {
  const api = useApi();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ accountIds }: { accountIds: string[]}) => {
      const ids = accountIds.map((id) => `id[]=${id}`).join('&');

      return api(`/api/v1/accounts/relationships?${ids}`);
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
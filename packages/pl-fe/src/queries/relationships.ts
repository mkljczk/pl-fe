import { useMutation } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/useClient';

const useFetchRelationships = () => {
  const client = useClient();

  return useMutation({
    mutationFn: ({ accountIds }: { accountIds: string[]}) => {
      return client.accounts.getRelationships(accountIds);
    },
  });
};

export { useFetchRelationships };

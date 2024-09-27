import { useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks';

const useStatus = (statusId: string) => {
  const client = useClient();

  return useQuery({
    queryKey: ['statuses', statusId],
    queryFn: () => client.statuses.getStatus(statusId),
  });
};

export { useStatus };

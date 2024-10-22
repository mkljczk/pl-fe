import { useQuery } from '@tanstack/react-query';
import { instanceSchema } from 'pl-api';
import * as v from 'valibot';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';

const placeholderData = v.parse(instanceSchema, {});

const useInstance = () => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  return useQuery({
    queryKey: ['instance'],
    queryFn: client.instance.getInstance,
    placeholderData,
  }, queryClient);
};

export { useInstance };

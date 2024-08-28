import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks';
import { queryClient } from 'pl-fe/queries/client';
import { relaySchema, type Relay } from 'pl-fe/schemas';

const useRelays = () => {
  const client = useClient();

  const getRelays = async () => {
    const { json: data } = await client.request<{ relays: Relay[] }>('/api/v1/pleroma/admin/relay');

    const normalizedData = data.relays?.map((relay) => relaySchema.parse(relay));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<Relay>>({
    queryKey: ['admin', 'relays'],
    queryFn: getRelays,
    placeholderData: [],
  });

  const {
    mutate: followRelay,
    isPending: isPendingFollow,
  } = useMutation({
    mutationFn: (relayUrl: string) => client.request('/api/v1/pleroma/admin/relays', {
      method: 'POST',
      body: JSON.stringify({ relay_url: relayUrl }),
    }),
    retry: false,
    onSuccess: ({ json: data }) =>
      queryClient.setQueryData(['admin', 'relays'], (prevResult: ReadonlyArray<Relay>) =>
        [...prevResult, relaySchema.parse(data)],
      ),
  });

  const {
    mutate: unfollowRelay,
    isPending: isPendingUnfollow,
  } = useMutation({
    mutationFn: (relayUrl: string) => client.request('/api/v1/pleroma/admin/relays', {
      method: 'DELETE',
      body: JSON.stringify({ relay_url: relayUrl }),
    }),
    retry: false,
    onSuccess: (_, relayUrl) =>
      queryClient.setQueryData(['admin', 'relays'], (prevResult: ReadonlyArray<Relay>) =>
        prevResult.filter(({ actor }) => actor !== relayUrl),
      ),
  });

  return {
    ...result,
    followRelay,
    isPendingFollow,
    unfollowRelay,
    isPendingUnfollow,
  };
};

export { useRelays };

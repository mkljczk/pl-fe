import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { queryClient } from 'soapbox/queries/client';
import { relaySchema, type Relay } from 'soapbox/schemas';

const useRelays = () => {
  const api = useApi();

  const getRelays = async () => {
    const { json: data } = await api<{ relays: Relay[] }>('/api/v1/pleroma/admin/relay');

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
    mutationFn: (relayUrl: string) => api('/api/v1/pleroma/admin/relays', {
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
    mutationFn: (relayUrl: string) => api('/api/v1/pleroma/admin/relays', {
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

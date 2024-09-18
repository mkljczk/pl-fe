import { useQuery } from '@tanstack/react-query';

import { useClient, useFeatures } from 'pl-fe/hooks';

import type { Scrobble } from 'pl-api';

interface UseScrobblesOpts {
  enabled?: boolean;
}

const useAccountScrobble = (
  accountId?: string,
  opts: UseScrobblesOpts = {},
) => {
  const client = useClient();
  const features = useFeatures();
  const { enabled = false } = opts;

  const { data: scrobble, ...result } = useQuery<Scrobble>({
    queryKey: ['scrobbles', accountId!],
    queryFn: async () =>
      (await client.accounts.getScrobbles(accountId!, { limit: 1 })).items[0],
    placeholderData: undefined,
    enabled: enabled && !!accountId && features.scrobbles,
    staleTime: 3 * 60 * 1000,
  });

  return { scrobble, ...result };
};

export { useAccountScrobble };

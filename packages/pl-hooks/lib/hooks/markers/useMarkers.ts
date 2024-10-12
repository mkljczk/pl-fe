import { useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks';
import { queryClient } from 'pl-fe/queries/client';

import type { PlApiClient } from 'pl-api';

type Timeline = 'home' | 'notifications';

const useMarker = (timeline: Timeline) => {
  const client = useClient();

  return useQuery({
    queryKey: ['markers', timeline],
    queryFn: () => client.timelines.getMarkers([timeline]).then(markers => markers[timeline]),
  });
};

const prefetchMarker = (client: PlApiClient, timeline: 'home' | 'notifications') =>
  queryClient.prefetchQuery({
    queryKey: ['markers', timeline],
    queryFn: () => client.timelines.getMarkers([timeline]).then(markers => markers[timeline]),
  });

export { useMarker, prefetchMarker, type Timeline };

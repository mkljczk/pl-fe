import { useQuery } from '@tanstack/react-query';

import { fetchTrendsSuccess } from 'soapbox/actions/trends';
import { useAppDispatch, useClient } from 'soapbox/hooks';

import type { Tag } from 'pl-api';

const useTrends = () => {
  const dispatch = useAppDispatch();
  const client = useClient();

  const getTrends = async() => {
    const data = await client.trends.getTrendingTags();

    dispatch(fetchTrendsSuccess(data));

    return data;
  };

  const result = useQuery<ReadonlyArray<Tag>>({
    queryKey: ['trends'],
    queryFn: getTrends,
    placeholderData: [],
    staleTime: 600000, // 10 minutes
  });

  return result;
};

export { useTrends as default };

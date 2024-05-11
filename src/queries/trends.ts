import { useQuery } from '@tanstack/react-query';

import { fetchTrendsSuccess } from 'soapbox/actions/trends';
import { useApi, useAppDispatch } from 'soapbox/hooks';
import { normalizeTag } from 'soapbox/normalizers';

import type { Tag } from 'soapbox/types/entities';

export default function useTrends() {
  const api = useApi();
  const dispatch = useAppDispatch();

  const getTrends = async() => {
    const { json: data } = await api<any[]>('/api/v1/trends');

    dispatch(fetchTrendsSuccess(data));

    const normalizedData = data.map((tag) => normalizeTag(tag));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<Tag>>({
    queryKey: ['trends'],
    queryFn: getTrends,
    placeholderData: [],
    staleTime: 600000, // 10 minutes
  });

  return result;
}

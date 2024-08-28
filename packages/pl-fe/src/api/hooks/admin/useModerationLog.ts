import { useInfiniteQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks';
import { moderationLogEntrySchema, type ModerationLogEntry } from 'pl-fe/schemas';

interface ModerationLogResult {
  items: ModerationLogEntry[];
  total: number;
}

const flattenPages = (pages?: ModerationLogResult[]): ModerationLogEntry[] => (pages || []).map(({ items }) => items).flat();

const useModerationLog = () => {
  const client = useClient();

  const getModerationLog = async (page: number): Promise<ModerationLogResult> => {
    const { json: data } = await client.request<ModerationLogResult>('/api/v1/pleroma/admin/moderation_log', { params: { page } });

    const normalizedData = data.items.map((domain) => moderationLogEntrySchema.parse(domain));

    return {
      items: normalizedData,
      total: data.total,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['admin', 'moderation_log'],
    queryFn: ({ pageParam }) => getModerationLog(pageParam),
    initialPageParam: 1,
    getNextPageParam: (page, allPages) => flattenPages(allPages)!.length >= page.total ? undefined : allPages.length + 1,
  });

  const data = flattenPages(queryInfo.data?.pages);

  return {
    ...queryInfo,
    data,
  };
};

export { useModerationLog };

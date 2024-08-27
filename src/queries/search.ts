import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { useClient } from 'soapbox/hooks';
import { flattenPages } from 'soapbox/utils/queries';

import type { Account, PaginatedResponse } from 'pl-api';

const useAccountSearch = (q: string) => {
  const client = useClient();

  const getAccountSearch = async(q: string, pageParam?: Pick<PaginatedResponse<Account>, 'next'>): Promise<PaginatedResponse<Account>> => {
    if (pageParam?.next) return pageParam.next();

    const response = await client.accounts.searchAccounts(q, {
      limit: 10,
      following: true,
      offset: 0,
    });

    return {
      previous: null,
      next: null,
      items: response,
      partial: false,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['search', 'accounts', q],
    queryFn: ({ pageParam }) => getAccountSearch(q, pageParam),
    placeholderData: keepPreviousData,
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<Account>>) | null },
    getNextPageParam: (config) => config.next ? config : undefined,
  });

  const data = flattenPages(queryInfo.data);

  return {
    ...queryInfo,
    data,
  };
};

export { useAccountSearch as default };

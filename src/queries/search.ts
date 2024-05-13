import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { getNextLink } from 'soapbox/api';
import { useApi } from 'soapbox/hooks';
import { Account } from 'soapbox/types/entities';
import { flattenPages, PaginatedResult } from 'soapbox/utils/queries';

const useAccountSearch = (q: string) => {
  const api = useApi();

  const getAccountSearch = async(q: string, pageParam: { link?: string }): Promise<PaginatedResult<Account>> => {
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || '/api/v1/accounts/search';

    const response = await api(uri, {
      params: {
        q,
        limit: 10,
        followers: true,
      },
    });
    const { json: data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;

    return {
      result: data,
      link,
      hasMore,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['search', 'accounts', q],
    queryFn: ({ pageParam }) => getAccountSearch(q, pageParam),
    placeholderData: keepPreviousData,
    initialPageParam: { link: undefined as string | undefined },
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo.data);

  return {
    ...queryInfo,
    data,
  };
};

export { useAccountSearch as default };

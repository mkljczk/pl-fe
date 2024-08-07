import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { useClient } from 'soapbox/hooks';

import type { Account } from 'pl-api';

const useAccountSearch = (q: string) => {
  const client = useClient();

  const getAccountSearch = async(q: string): Promise<Account[]> => {
    const response = await client.accounts.searchAccounts(q, {
      limit: 10,
      following: true,
      offset: data?.length,
    });

    return response;
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['search', 'accounts', q],
    queryFn: () => getAccountSearch(q),
    placeholderData: keepPreviousData,
    initialPageParam: {},
    getNextPageParam: () => {
      if (queryInfo.data?.pages[queryInfo.data.pages.length - 1].length !== 10) {
        return {};
      }

      return undefined;
    },
  });

  const data = queryInfo.data?.pages.flat();

  return {
    ...queryInfo,
    data,
  };
};

export { useAccountSearch as default };

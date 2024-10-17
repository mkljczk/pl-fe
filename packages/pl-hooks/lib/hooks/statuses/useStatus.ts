import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { queryClient, usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { importEntities } from 'pl-hooks/importer';

import { normalizeStatus, type Status } from '../../normalizers/normalizeStatus';

import type { Account } from 'pl-hooks/normalizers/normalizeAccount';

// const toServerSideType = (columnType: string): Filter['context'][0] => {
//   switch (columnType) {
//     case 'home':
//     case 'notifications':
//     case 'public':
//     case 'thread':
//       return columnType;
//     default:
//       if (columnType.includes('list:')) {
//         return 'home';
//       } else {
//         return 'public'; // community, account, hashtag
//       }
//   }
// };

// type FilterContext = { contextType?: string };

// const getFilters = (state: RootState, query: FilterContext) =>
//   state.filters.filter((filter) =>
//     (!query?.contextType || filter.context.includes(toServerSideType(query.contextType)))
//       && (filter.expires_at === null || Date.parse(filter.expires_at) > new Date().getTime()),
//   );

// const escapeRegExp = (string: string) =>
//   string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

// const regexFromFilters = (filters: ImmutableList<Filter>) => {
//   if (filters.size === 0) return null;

//   return new RegExp(filters.map(filter =>
//     filter.keywords.map(keyword => {
//       let expr = escapeRegExp(keyword.keyword);

//       if (keyword.whole_word) {
//         if (/^[\w]/.test(expr)) {
//           expr = `\\b${expr}`;
//         }

//         if (/[\w]$/.test(expr)) {
//           expr = `${expr}\\b`;
//         }
//       }

//       return expr;
//     }).join('|'),
//   ).join('|'), 'i');
// };

// const checkFiltered = (index: string, filters: ImmutableList<Filter>) =>
//   filters.reduce((result: Array<string>, filter) =>
//     result.concat(filter.keywords.reduce((result: Array<string>, keyword) => {
//       let expr = escapeRegExp(keyword.keyword);

//       if (keyword.whole_word) {
//         if (/^[\w]/.test(expr)) {
//           expr = `\\b${expr}`;
//         }

//         if (/[\w]$/.test(expr)) {
//           expr = `${expr}\\b`;
//         }
//       }

//       const regex = new RegExp(expr);

//       if (regex.test(index)) return result.concat(filter.title);
//       return result;
//     }, [])), []);

const importStatus = (status: Status) => {
  queryClient.setQueryData<Status>(
    ['statuses', 'entities', status.id],
    status,
  );
};

const useStatus = (statusId?: string, opts: { language?: string } = {}) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  const statusQuery = useQuery({
    queryKey: ['statuses', 'entities', statusId],
    queryFn: () => client.statuses.getStatus(statusId!, {
      language: opts.language,
    })
      .then(status => (importEntities({ statuses: [status] }, { withParents: false }), status))
      .then(normalizeStatus),
    enabled: !!statusId,
  }, queryClient);

  const status = statusQuery.data;

  queryClient.getQueriesData({ queryKey: ['test', ['t']] });

  const accountsQuery = queryClient.getQueriesData<Account>({
    queryKey: ['accounts', 'entities', status?.account_ids],
  });

  let data: (Status & {
    account: Account;
    accounts: Array<Account>;
  }) | null = null;

  if (status) {
    data = {
      ...status,
      account: accountsQuery[0][1]!,
      accounts: accountsQuery.map(([_, account]) => account!).filter(Boolean),
      // quote,
      // reblog,
      // poll
    };
  }

  return { ...statusQuery, data };
};

export { useStatus, importStatus };

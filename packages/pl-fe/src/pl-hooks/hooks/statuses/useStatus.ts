import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import { useAccount, useGroup } from 'pl-fe/api/hooks';
import { useAppSelector, useClient } from 'pl-fe/hooks';
import { importEntities } from 'pl-fe/pl-hooks/importer';
import { queryClient } from 'pl-fe/queries/client';
import { selectAccount, selectAccounts } from 'pl-fe/selectors';

import { type MinifiedStatus, minifyStatus } from '../../minifiers/minifyStatus';
import { normalizeStatus } from '../../normalizers/normalizeStatus';

// import type { Group } from 'pl-fe/normalizers';

type Account = ReturnType<typeof selectAccount>;

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

const importStatus = (status: MinifiedStatus) => {
  queryClient.setQueryData<MinifiedStatus>(
    ['statuses', 'entities', status.id],
    status,
  );
};

const useStatus = (statusId?: string) => {
  const client = useClient();
  const intl = useIntl();

  const statusQuery = useQuery({
    queryKey: ['statuses', 'entities', statusId],
    queryFn: () => client.statuses.getStatus(statusId!, {
      language: intl.locale,
    })
      .then(status => (importEntities({ statuses: [status] }, { withParents: false }), status))
      .then(normalizeStatus)
      .then(minifyStatus),
    enabled: !!statusId,
  });

  const status = statusQuery.data;

  const { account } = useAccount(status?.account_id || undefined);
  const { group } = useGroup(status?.group_id || undefined);

  // : (Status & {
  //   account: Account;
  //   accounts: Array<Account>;
  //   group: Group | null;
  //   reblog: Status | null;
  // }) | null
  const data = useAppSelector((state) => {
    if (!status) return null;
    const accounts = selectAccounts(state, status.account_ids).filter((account): account is Account => account !== undefined);

    return {
      ...status,
      account: account!,
      accounts,
      group,
      // quote,
      // reblog,
      // poll
      
    };
  });

  return { ...statusQuery, data };
};

export { useStatus, importStatus };

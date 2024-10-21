import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { importEntities } from 'pl-hooks/importer';

import { useAccount, type UseAccountOpts } from './useAccount';

const useAccountLookup = (acct?: string, opts: UseAccountOpts = {}) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();
  const { features } = client;

  const accountIdQuery = useQuery({
    queryKey: ['accounts', 'byAcct', acct?.toLocaleLowerCase()],
    queryFn: () => (
      features.accountByUsername && !features.accountLookup
        ? client.accounts.getAccount(acct!)
        : client.accounts.lookupAccount(acct!)
    ).then((account) => {
      importEntities({ accounts: [account] });

      return account.id;
    }),
    enabled: !!acct,
  }, queryClient);

  return useAccount(accountIdQuery.data, opts);
};

export { useAccountLookup };

import { useCallback } from 'react';

import { makeGetAccount } from 'soapbox/selectors';

import { useAppSelector } from './useAppSelector';

/** Get the logged-in account from the store, if any. */
const useOwnAccount = () => {
  const getAccount = useCallback(makeGetAccount(), []);

  const account = useAppSelector((state) => {
    const { me } = state;

    if (typeof me === 'string') {
      return getAccount(state, me);
    }
  });

  return { account: account || undefined };
};

export {
  useOwnAccount,
};

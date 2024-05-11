import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { accountSchema } from 'soapbox/schemas';
import { filteredArray } from 'soapbox/schemas/utils';

import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const ACCOUNT_IMPORT  = 'ACCOUNT_IMPORT';
const ACCOUNTS_IMPORT = 'ACCOUNTS_IMPORT';
const STATUS_IMPORT   = 'STATUS_IMPORT';
const STATUSES_IMPORT = 'STATUSES_IMPORT';
const POLLS_IMPORT    = 'POLLS_IMPORT';
const ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP = 'ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP';

const importAccount = (data: APIEntity) =>
  (dispatch: AppDispatch, _getState: () => RootState) => {
    dispatch({ type: ACCOUNT_IMPORT, account: data });
    try {
      const account = accountSchema.parse(data);
      dispatch(importEntities([account], Entities.ACCOUNTS));
    } catch (e) {
      //
    }
  };

const importAccounts = (data: APIEntity[]) =>
  (dispatch: AppDispatch, _getState: () => RootState) => {
    dispatch({ type: ACCOUNTS_IMPORT, accounts: data });
    try {
      const accounts = filteredArray(accountSchema).parse(data);
      dispatch(importEntities(accounts, Entities.ACCOUNTS));
    } catch (e) {
      //
    }
  };

const importStatus = (status: APIEntity, idempotencyKey?: string) => ({ type: STATUS_IMPORT, status, idempotencyKey });

const importStatuses = (statuses: APIEntity[]) => ({ type: STATUSES_IMPORT, statuses });

const importPolls = (polls: APIEntity[]) =>
  ({ type: POLLS_IMPORT, polls });

const importFetchedAccount = (account: APIEntity) =>
  importFetchedAccounts([account]);

const importFetchedAccounts = (accounts: APIEntity[], args = { should_refetch: false }) => {
  const { should_refetch } = args;
  const normalAccounts: APIEntity[] = [];

  const processAccount = (account: APIEntity) => {
    if (!account.id) return;

    if (should_refetch) {
      account.should_refetch = true;
    }

    normalAccounts.push(account);

    if (account.moved) {
      processAccount(account.moved);
    }
  };

  accounts.forEach(processAccount);

  return importAccounts(normalAccounts);
};

const importFetchedStatus = (status: APIEntity, idempotencyKey?: string) =>
  (dispatch: AppDispatch) => {
    // Skip broken statuses
    if (isBroken(status)) return;

    if (status.reblog?.id) {
      dispatch(importFetchedStatus(status.reblog));
    }

    // Fedibird quotes
    if (status.quote?.id) {
      dispatch(importFetchedStatus(status.quote));
    }

    // Pleroma quotes
    if (status.pleroma?.quote?.id) {
      dispatch(importFetchedStatus(status.pleroma.quote));
    }

    // Fedibird quote from reblog
    if (status.reblog?.quote?.id) {
      dispatch(importFetchedStatus(status.reblog.quote));
    }

    // Pleroma quote from reblog
    if (status.reblog?.pleroma?.quote?.id) {
      dispatch(importFetchedStatus(status.reblog.pleroma.quote));
    }

    if (status.poll?.id) {
      dispatch(importFetchedPoll(status.poll));
    }

    dispatch(importFetchedAccount(status.account));
    dispatch(importStatus(status, idempotencyKey));
  };

// Sometimes Pleroma can return an empty account,
// or a repost can appear of a deleted account. Skip these statuses.
const isBroken = (status: APIEntity) => {
  try {
    // Skip empty accounts
    // https://gitlab.com/soapbox-pub/soapbox/-/issues/424
    if (!status.account.id) return true;
    // Skip broken reposts
    // https://gitlab.com/soapbox-pub/rebased/-/issues/28
    if (status.reblog && !status.reblog.account.id) return true;
    return false;
  } catch (e) {
    return true;
  }
};

const importFetchedStatuses = (statuses: APIEntity[]) => (dispatch: AppDispatch) => {
  const accounts: APIEntity[] = [];
  const normalStatuses: APIEntity[] = [];
  const polls: APIEntity[] = [];

  function processStatus(status: APIEntity) {
    // Skip broken statuses
    if (isBroken(status)) return;

    normalStatuses.push(status);

    accounts.push(status.account);
    if (status.accounts) {
      accounts.push(...status.accounts);
    }

    if (status.reblog?.id) {
      processStatus(status.reblog);
    }

    // Fedibird quotes
    if (status.quote?.id) {
      processStatus(status.quote);
    }

    if (status.pleroma?.quote?.id) {
      processStatus(status.pleroma.quote);
    }

    if (status.poll?.id) {
      polls.push(status.poll);
    }
  }

  statuses.forEach(processStatus);

  dispatch(importPolls(polls));
  dispatch(importFetchedAccounts(accounts));
  dispatch(importStatuses(normalStatuses));
};

const importFetchedPoll = (poll: APIEntity) =>
  (dispatch: AppDispatch) => {
    dispatch(importPolls([poll]));
  };

const importErrorWhileFetchingAccountByUsername = (username: string) =>
  ({ type: ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP, username });

export {
  ACCOUNT_IMPORT,
  ACCOUNTS_IMPORT,
  STATUS_IMPORT,
  STATUSES_IMPORT,
  POLLS_IMPORT,
  ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP,
  importAccount,
  importAccounts,
  importStatus,
  importStatuses,
  importPolls,
  importFetchedAccount,
  importFetchedAccounts,
  importFetchedStatus,
  importFetchedStatuses,
  importFetchedPoll,
  importErrorWhileFetchingAccountByUsername,
};

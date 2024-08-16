import { accountSchema, groupSchema, type Account as BaseAccount, type Group, type Poll, type Status as BaseStatus } from 'pl-api';

import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { normalizeAccount, normalizeGroup } from 'soapbox/normalizers';
import { filteredArray } from 'soapbox/schemas/utils';

import type { AppDispatch } from 'soapbox/store';

const ACCOUNT_IMPORT = 'ACCOUNT_IMPORT';
const ACCOUNTS_IMPORT = 'ACCOUNTS_IMPORT';
const STATUS_IMPORT = 'STATUS_IMPORT';
const STATUSES_IMPORT = 'STATUSES_IMPORT';
const POLLS_IMPORT = 'POLLS_IMPORT';
const ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP = 'ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP';

const importAccount = (data: BaseAccount) => importAccounts([data]);

const importAccounts = (data: Array<BaseAccount>) => (dispatch: AppDispatch) => {
  dispatch({ type: ACCOUNTS_IMPORT, accounts: data });
  try {
    const accounts = filteredArray(accountSchema).parse(data).map(normalizeAccount);
    dispatch(importEntities(accounts, Entities.ACCOUNTS));
  } catch (e) {
    //
  }
};

const importGroup = (data: Group) => importGroups([data]);

const importGroups = (data: Array<Group>) => (dispatch: AppDispatch) => {
  try {
    const groups = filteredArray(groupSchema).parse(data).map(normalizeGroup);
    dispatch(importEntities(groups, Entities.GROUPS));
  } catch (e) {
    //
  }
};

const importStatus = (status: BaseStatus, idempotencyKey?: string) => ({ type: STATUS_IMPORT, status, idempotencyKey });

const importStatuses = (statuses: Array<BaseStatus>) => ({ type: STATUSES_IMPORT, statuses });

const importPolls = (polls: Array<Poll>) => ({ type: POLLS_IMPORT, polls });

const importFetchedAccount = (account: BaseAccount) =>
  importFetchedAccounts([account]);

const importFetchedAccounts = (accounts: Array<BaseAccount>) => {
  const normalAccounts: Array<BaseAccount> = [];

  const processAccount = (account: BaseAccount) => {
    if (!account.id) return;

    normalAccounts.push(account);

    if (account.moved) {
      processAccount(account.moved);
    }
  };

  accounts.forEach(processAccount);

  return importAccounts(normalAccounts);
};

const importFetchedStatus = (status: BaseStatus, idempotencyKey?: string) =>
  (dispatch: AppDispatch) => {
    // Skip broken statuses
    if (isBroken(status)) return;

    if (status.reblog?.id) {
      dispatch(importFetchedStatus(status.reblog as BaseStatus));
    }

    // Fedibird quotes
    if (status.quote?.id) {
      dispatch(importFetchedStatus(status.quote as BaseStatus));
    }

    // WIP restore this
    // Fedibird quote from reblog
    // if (status.reblog?.quote?.id) {
    //   dispatch(importFetchedStatus(status.reblog.quote));
    // }

    if (status.poll?.id) {
      dispatch(importFetchedPoll(status.poll));
    }

    if (status.group?.id) {
      dispatch(importGroup(status.group));
    }

    dispatch(importFetchedAccount(status.account));
    dispatch(importStatus(status, idempotencyKey));
  };

// Sometimes Pleroma can return an empty account,
// or a repost can appear of a deleted account. Skip these statuses.
const isBroken = (status: BaseStatus) => {
  try {
    if (status.scheduled_at !== null) return true;
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

const importFetchedStatuses = (statuses: Array<BaseStatus>) => (dispatch: AppDispatch) => {
  const accounts: Array<BaseAccount> = [];
  const normalStatuses: Array<BaseStatus> = [];
  const polls: Array<Poll> = [];

  const processStatus = (status: BaseStatus) => {
    // Skip broken statuses
    if (isBroken(status)) return;

    normalStatuses.push(status);

    accounts.push(status.account);
    // if (status.accounts) {
    //   accounts.push(...status.accounts);
    // }

    if (status.reblog?.id) {
      processStatus(status.reblog as BaseStatus);
    }

    // Fedibird quotes
    if (status.quote?.id) {
      processStatus(status.quote as BaseStatus);
    }

    if (status.poll?.id) {
      polls.push(status.poll);
    }
  };

  statuses.forEach(processStatus);

  dispatch(importPolls(polls));
  dispatch(importFetchedAccounts(accounts));
  dispatch(importStatuses(normalStatuses));
};

const importFetchedPoll = (poll: Poll) =>
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
  importGroup,
  importGroups,
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

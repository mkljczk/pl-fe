import { getClient } from '../api';

import { importFetchedAccounts } from './importer';

import type { Account, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const GROUP_BLOCKS_FETCH_REQUEST = 'GROUP_BLOCKS_FETCH_REQUEST';
const GROUP_BLOCKS_FETCH_SUCCESS = 'GROUP_BLOCKS_FETCH_SUCCESS';
const GROUP_BLOCKS_FETCH_FAIL    = 'GROUP_BLOCKS_FETCH_FAIL';

const GROUP_UNBLOCK_REQUEST = 'GROUP_UNBLOCK_REQUEST';
const GROUP_UNBLOCK_SUCCESS = 'GROUP_UNBLOCK_SUCCESS';
const GROUP_UNBLOCK_FAIL    = 'GROUP_UNBLOCK_FAIL';

const groupKick = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    return getClient(getState).experimental.groups.kickGroupUsers(groupId, [accountId]);
  };

const fetchGroupBlocks = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchGroupBlocksRequest(id));

    return getClient(getState).experimental.groups.getGroupBlocks(id).then(response => {
      dispatch(importFetchedAccounts(response.items));
      dispatch(fetchGroupBlocksSuccess(id, response.items, response.next));
    }).catch(error => {
      dispatch(fetchGroupBlocksFail(id, error));
    });
  };

const fetchGroupBlocksRequest = (id: string) => ({
  type: GROUP_BLOCKS_FETCH_REQUEST,
  id,
});

const fetchGroupBlocksSuccess = (id: string, accounts: APIEntity[], next: (() => Promise<PaginatedResponse<Account>>) | null) => ({
  type: GROUP_BLOCKS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchGroupBlocksFail = (id: string, error: unknown) => ({
  type: GROUP_BLOCKS_FETCH_FAIL,
  id,
  error,
  skipNotFound: true,
});

const groupUnblock = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(groupUnblockRequest(groupId, accountId));

    return getClient(getState).experimental.groups.unblockGroupUsers(groupId, [accountId])
      .then(() => dispatch(groupUnblockSuccess(groupId, accountId)))
      .catch(err => dispatch(groupUnblockFail(groupId, accountId, err)));
  };

const groupUnblockRequest = (groupId: string, accountId: string) => ({
  type: GROUP_UNBLOCK_REQUEST,
  groupId,
  accountId,
});

const groupUnblockSuccess = (groupId: string, accountId: string) => ({
  type: GROUP_UNBLOCK_SUCCESS,
  groupId,
  accountId,
});

const groupUnblockFail = (groupId: string, accountId: string, error: unknown) => ({
  type: GROUP_UNBLOCK_FAIL,
  groupId,
  accountId,
  error,
});

export {
  GROUP_BLOCKS_FETCH_REQUEST,
  GROUP_BLOCKS_FETCH_SUCCESS,
  GROUP_BLOCKS_FETCH_FAIL,
  GROUP_UNBLOCK_REQUEST,
  GROUP_UNBLOCK_SUCCESS,
  GROUP_UNBLOCK_FAIL,
  groupKick,
  fetchGroupBlocks,
  fetchGroupBlocksRequest,
  fetchGroupBlocksSuccess,
  fetchGroupBlocksFail,
  groupUnblock,
  groupUnblockRequest,
  groupUnblockSuccess,
  groupUnblockFail,
};

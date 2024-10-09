import { queryClient } from 'pl-fe/queries/client';
import KVStore from 'pl-fe/storage/kv-store';

import type { Account } from 'pl-fe/pl-hooks/normalizers/normalizeAccount';
import type { AppDispatch, RootState } from 'pl-fe/store';

const DRAFT_STATUSES_FETCH_SUCCESS = 'DRAFT_STATUSES_FETCH_SUCCESS' as const;

const PERSIST_DRAFT_STATUS = 'PERSIST_DRAFT_STATUS' as const;
const CANCEL_DRAFT_STATUS = 'DELETE_DRAFT_STATUS' as const;

const fetchDraftStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountUrl = queryClient.getQueryData<Account>(['accounts', 'entities', state.me])!.url;

    return KVStore.getItem(`drafts:${accountUrl}`).then((statuses) => {
      dispatch({
        type: DRAFT_STATUSES_FETCH_SUCCESS,
        statuses,
      });
    }).catch(() => {});
  };

const saveDraftStatus = (composeId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountUrl = queryClient.getQueryData<Account>(['accounts', 'entities', state.me])!.url;

    const compose = state.compose.get(composeId)!;

    const draft = {
      ...compose.toJS(),
      draft_id: compose.draft_id || crypto.randomUUID(),
    };

    dispatch({
      type: PERSIST_DRAFT_STATUS,
      status: draft,
      accountUrl,
    });
  };

const cancelDraftStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountUrl = queryClient.getQueryData<Account>(['accounts', 'entities', state.me])!.url;

    dispatch({
      type: CANCEL_DRAFT_STATUS,
      statusId,
      accountUrl,
    });
  };

export {
  DRAFT_STATUSES_FETCH_SUCCESS,
  PERSIST_DRAFT_STATUS,
  CANCEL_DRAFT_STATUS,
  fetchDraftStatuses,
  saveDraftStatus,
  cancelDraftStatus,
};

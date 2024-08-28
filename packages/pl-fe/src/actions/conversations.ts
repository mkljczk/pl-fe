import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import {
  importFetchedAccounts,
  importFetchedStatuses,
  importFetchedStatus,
} from './importer';

import type { Account, Conversation, PaginatedResponse, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const CONVERSATIONS_MOUNT = 'CONVERSATIONS_MOUNT' as const;
const CONVERSATIONS_UNMOUNT = 'CONVERSATIONS_UNMOUNT' as const;

const CONVERSATIONS_FETCH_REQUEST = 'CONVERSATIONS_FETCH_REQUEST' as const;
const CONVERSATIONS_FETCH_SUCCESS = 'CONVERSATIONS_FETCH_SUCCESS' as const;
const CONVERSATIONS_FETCH_FAIL = 'CONVERSATIONS_FETCH_FAIL' as const;
const CONVERSATIONS_UPDATE = 'CONVERSATIONS_UPDATE' as const;

const CONVERSATIONS_READ = 'CONVERSATIONS_READ' as const;

const mountConversations = () => ({ type: CONVERSATIONS_MOUNT });

const unmountConversations = () => ({ type: CONVERSATIONS_UNMOUNT });

const markConversationRead = (conversationId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch({
    type: CONVERSATIONS_READ,
    conversationId,
  });

  return getClient(getState).timelines.markConversationRead(conversationId);
};

const expandConversations = (expand = true) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;
  const state = getState();

  dispatch(expandConversationsRequest());

  const isLoadingRecent = !!state.conversations.next;

  if (isLoadingRecent && !expand) return;

  return (state.conversations.next?.() || getClient(state).timelines.getConversations())
    .then(response => {
      dispatch(importFetchedAccounts(response.items.reduce((aggr: Array<Account>, item) => aggr.concat(item.accounts), [])));
      dispatch(importFetchedStatuses(response.items.map((item) => item.last_status).filter((x): x is Status => x !== null)));
      dispatch(expandConversationsSuccess(response.items, response.next, isLoadingRecent));
    })
    .catch(err => dispatch(expandConversationsFail(err)));
};

const expandConversationsRequest = () => ({ type: CONVERSATIONS_FETCH_REQUEST });

const expandConversationsSuccess = (
  conversations: Conversation[],
  next: (() => Promise<PaginatedResponse<Conversation>>) | null,
  isLoadingRecent: boolean,
) => ({
  type: CONVERSATIONS_FETCH_SUCCESS,
  conversations,
  next,
  isLoadingRecent,
});

const expandConversationsFail = (error: unknown) => ({
  type: CONVERSATIONS_FETCH_FAIL,
  error,
});

const updateConversations = (conversation: Conversation) => (dispatch: AppDispatch) => {
  dispatch(importFetchedAccounts(conversation.accounts));

  if (conversation.last_status) {
    dispatch(importFetchedStatus(conversation.last_status));
  }

  return dispatch({
    type: CONVERSATIONS_UPDATE,
    conversation,
  });
};

export {
  CONVERSATIONS_MOUNT,
  CONVERSATIONS_UNMOUNT,
  CONVERSATIONS_FETCH_REQUEST,
  CONVERSATIONS_FETCH_SUCCESS,
  CONVERSATIONS_FETCH_FAIL,
  CONVERSATIONS_UPDATE,
  CONVERSATIONS_READ,
  mountConversations,
  unmountConversations,
  markConversationRead,
  expandConversations,
  expandConversationsRequest,
  expandConversationsSuccess,
  expandConversationsFail,
  updateConversations,
};

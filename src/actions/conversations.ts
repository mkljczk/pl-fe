import { isLoggedIn } from 'soapbox/utils/auth';

import { getClient } from '../api';

import {
  importFetchedAccounts,
  importFetchedStatuses,
  importFetchedStatus,
} from './importer';

import type { Conversation, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const CONVERSATIONS_MOUNT   = 'CONVERSATIONS_MOUNT';
const CONVERSATIONS_UNMOUNT = 'CONVERSATIONS_UNMOUNT';

const CONVERSATIONS_FETCH_REQUEST = 'CONVERSATIONS_FETCH_REQUEST';
const CONVERSATIONS_FETCH_SUCCESS = 'CONVERSATIONS_FETCH_SUCCESS';
const CONVERSATIONS_FETCH_FAIL    = 'CONVERSATIONS_FETCH_FAIL';
const CONVERSATIONS_UPDATE        = 'CONVERSATIONS_UPDATE';

const CONVERSATIONS_READ = 'CONVERSATIONS_READ';

const mountConversations = () => ({
  type: CONVERSATIONS_MOUNT,
});

const unmountConversations = () => ({
  type: CONVERSATIONS_UNMOUNT,
});

const markConversationRead = (conversationId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch({
    type: CONVERSATIONS_READ,
    id: conversationId,
  });

  return getClient(getState).timelines.markConversationRead(conversationId);
};

const expandConversations = ({ maxId }: Record<string, any> = {}) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(expandConversationsRequest());

  const params: Record<string, any> = { max_id: maxId };

  if (!maxId) {
    params.since_id = getState().conversations.items.getIn([0, 'id']);
  }

  const isLoadingRecent = !!params.since_id;

  return getClient(getState).timelines.getConversations(params)
    .then(response => {
      dispatch(importFetchedAccounts(response.items.reduce((aggr: Array<APIEntity>, item: APIEntity) => aggr.concat(item.accounts), [])));
      dispatch(importFetchedStatuses(response.items.map((item: Record<string, any>) => item.last_status).filter((x?: APIEntity) => !!x)));
      dispatch(expandConversationsSuccess(response.items, response.next, isLoadingRecent));
    })
    .catch(err => dispatch(expandConversationsFail(err)));
};

const expandConversationsRequest = () => ({
  type: CONVERSATIONS_FETCH_REQUEST,
});

const expandConversationsSuccess = (
  conversations: APIEntity[],
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

const updateConversations = (conversation: APIEntity) => (dispatch: AppDispatch) => {
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
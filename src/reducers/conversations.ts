import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';
import pick from 'lodash/pick';

import {
  CONVERSATIONS_MOUNT,
  CONVERSATIONS_UNMOUNT,
  CONVERSATIONS_FETCH_REQUEST,
  CONVERSATIONS_FETCH_SUCCESS,
  CONVERSATIONS_FETCH_FAIL,
  CONVERSATIONS_UPDATE,
  CONVERSATIONS_READ,
} from '../actions/conversations';
import { compareDate } from '../utils/comparators';

import type { Conversation, PaginatedResponse } from 'pl-api';
import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  items: ImmutableList<MinifiedConversation>(),
  isLoading: false,
  hasMore: true,
  next: null as (() => Promise<PaginatedResponse<Conversation>>) | null,
  mounted: 0,
});

type State = ReturnType<typeof ReducerRecord>;

const minifyConversation = (conversation: Conversation) => ({
  ...(pick(conversation, ['id', 'unread'])),
  accounts: conversation.accounts.map(a => a.id),
  last_status: conversation.last_status?.id || null,
  last_status_created_at: conversation.last_status?.created_at || null,
});

type MinifiedConversation = ReturnType<typeof minifyConversation>;

const updateConversation = (state: State, item: Conversation) => state.update('items', list => {
  const index = list.findIndex(x => x.id === item.id);
  const newItem = minifyConversation(item);

  if (index === -1) {
    return list.unshift(newItem);
  } else {
    return list.set(index, newItem);
  }
});

const expandNormalizedConversations = (state: State, conversations: Conversation[], next: (() => Promise<PaginatedResponse<Conversation>>) | null, isLoadingRecent?: boolean) => {
  let items = ImmutableList(conversations.map(minifyConversation));

  return state.withMutations(mutable => {
    if (!items.isEmpty()) {
      mutable.update('items', list => {
        list = list.map(oldItem => {
          const newItemIndex = items.findIndex(x => x.id === oldItem.id);

          if (newItemIndex === -1) {
            return oldItem;
          }

          const newItem = items.get(newItemIndex);
          items = items.delete(newItemIndex);

          return newItem!;
        });

        list = list.concat(items);

        return list.sortBy(x => x.last_status_created_at, (a, b) => {
          if (a === null || b === null) {
            return -1;
          }

          return compareDate(a, b);
        });
      });
    }

    if (!next && !isLoadingRecent) {
      mutable.set('hasMore', false);
    }

    mutable.set('next', next);
    mutable.set('isLoading', false);
  });
};

const conversations = (state = ReducerRecord(), action: AnyAction) => {
  switch (action.type) {
    case CONVERSATIONS_FETCH_REQUEST:
      return state.set('isLoading', true);
    case CONVERSATIONS_FETCH_FAIL:
      return state.set('isLoading', false);
    case CONVERSATIONS_FETCH_SUCCESS:
      return expandNormalizedConversations(state, action.conversations, action.next, action.isLoadingRecent);
    case CONVERSATIONS_UPDATE:
      return updateConversation(state, action.conversation);
    case CONVERSATIONS_MOUNT:
      return state.update('mounted', count => count + 1);
    case CONVERSATIONS_UNMOUNT:
      return state.update('mounted', count => count - 1);
    case CONVERSATIONS_READ:
      return state.update('items', list => list.map(item => {
        if (item.id === action.conversationId) {
          return { ...item, unread: false };
        }

        return item;
      }));
    default:
      return state;
  }
};

export { conversations as default };

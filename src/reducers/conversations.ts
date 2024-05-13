import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

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

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

const ConversationRecord = ImmutableRecord({
  id: '',
  unread: false,
  accounts: ImmutableList<string>(),
  last_status: null as string | null,
  last_status_created_at: null as string | null,
});

const ReducerRecord = ImmutableRecord({
  items: ImmutableList<Conversation>(),
  isLoading: false,
  hasMore: true,
  mounted: 0,
});

type State = ReturnType<typeof ReducerRecord>;
type Conversation = ReturnType<typeof ConversationRecord>;

const conversationToMap = (item: APIEntity) => ConversationRecord({
  id: item.id,
  unread: item.unread,
  accounts: ImmutableList(item.accounts.map((a: APIEntity) => a.id)),
  last_status: item.last_status ? item.last_status.id : null,
  last_status_created_at: item.last_status ? item.last_status.created_at : null,
});

const updateConversation = (state: State, item: APIEntity) => state.update('items', list => {
  const index   = list.findIndex(x => x.get('id') === item.id);
  const newItem = conversationToMap(item);

  if (index === -1) {
    return list.unshift(newItem);
  } else {
    return list.set(index, newItem);
  }
});

const expandNormalizedConversations = (state: State, conversations: APIEntity[], next: string | null, isLoadingRecent?: boolean) => {
  let items = ImmutableList(conversations.map(conversationToMap));

  return state.withMutations(mutable => {
    if (!items.isEmpty()) {
      mutable.update('items', list => {
        list = list.map(oldItem => {
          const newItemIndex = items.findIndex(x => x.get('id') === oldItem.get('id'));

          if (newItemIndex === -1) {
            return oldItem;
          }

          const newItem = items.get(newItemIndex);
          items = items.delete(newItemIndex);

          return newItem!;
        });

        list = list.concat(items);

        return list.sortBy(x => x.get('last_status_created_at'), (a, b) => {
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
        if (item.get('id') === action.id) {
          return item.set('unread', false);
        }

        return item;
      }));
    default:
      return state;
  }
};

export { conversations as default };

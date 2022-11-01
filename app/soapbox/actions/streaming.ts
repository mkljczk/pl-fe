import { InfiniteData } from '@tanstack/react-query';

import { getSettings } from 'soapbox/actions/settings';
import messages from 'soapbox/locales/messages';
import { ChatKeys, isLastMessage } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import { updatePageItem, appendPageItem, removePageItem, flattenPages, PaginatedResult } from 'soapbox/utils/queries';
import { play, soundCache } from 'soapbox/utils/sounds';

import { connectStream } from '../stream';

import {
  deleteAnnouncement,
  fetchAnnouncements,
  updateAnnouncements,
  updateReaction as updateAnnouncementsReaction,
} from './announcements';
import { updateConversations } from './conversations';
import { fetchFilters } from './filters';
import { MARKER_FETCH_SUCCESS } from './markers';
import { updateNotificationsQueue, expandNotifications } from './notifications';
import { updateStatus } from './statuses';
import {
  // deleteFromTimelines,
  expandHomeTimeline,
  connectTimeline,
  disconnectTimeline,
  processTimelineUpdate,
} from './timelines';

import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Chat, ChatMessage } from 'soapbox/types/entities';

const STREAMING_CHAT_UPDATE = 'STREAMING_CHAT_UPDATE';
const STREAMING_FOLLOW_RELATIONSHIPS_UPDATE = 'STREAMING_FOLLOW_RELATIONSHIPS_UPDATE';

const validLocale = (locale: string) => Object.keys(messages).includes(locale);

const getLocale = (state: RootState) => {
  const locale = getSettings(state).get('locale') as string;
  return validLocale(locale) ? locale : 'en';
};

const updateFollowRelationships = (relationships: APIEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const me = getState().me;
    return dispatch({
      type: STREAMING_FOLLOW_RELATIONSHIPS_UPDATE,
      me,
      ...relationships,
    });
  };

interface ChatPayload extends Omit<Chat, 'last_message'> {
  last_message: ChatMessage | null,
}

const updateChat = (payload: ChatPayload) => {
  const { id: chatId, last_message: lastMessage } = payload;

  const currentChats = flattenPages(queryClient.getQueryData<InfiniteData<PaginatedResult<unknown>>>(ChatKeys.chatSearch()));

  // Update the specific Chat query data.
  queryClient.setQueryData<Chat>(ChatKeys.chat(chatId), payload as any);

  if (currentChats?.find((chat: any) => chat.id === chatId)) {
    // If the chat exists in the client, let's update it.
    updatePageItem<Chat>(ChatKeys.chatSearch(), payload as any, (o, n) => o.id === n.id);
  } else {
    // If this is a brand-new chat, let's invalid the queries.
    queryClient.invalidateQueries(ChatKeys.chatSearch());
  }

  if (lastMessage) {
    // Update the Chat Messages query data.
    appendPageItem(ChatKeys.chatMessages(payload.id), lastMessage);
  }
};

const removeChatMessage = (payload: string) => {
  const data = JSON.parse(payload);
  const chatId = data.chat_id;
  const chatMessageId = data.deleted_message_id;

  // If the user just deleted the "last_message", then let's invalidate
  // the Chat Search query so the Chat List will show the new "last_message".
  if (isLastMessage(chatMessageId)) {
    queryClient.invalidateQueries(ChatKeys.chatSearch());
  }

  removePageItem(ChatKeys.chatMessages(chatId), chatMessageId, (o: any, n: any) => String(o.id) === String(n));
};

const connectTimelineStream = (
  timelineId: string,
  path: string,
  pollingRefresh: ((dispatch: AppDispatch, done?: () => void) => void) | null = null,
  accept: ((status: APIEntity) => boolean) | null = null,
) => connectStream(path, pollingRefresh, (dispatch: AppDispatch, getState: () => RootState) => {
  const locale = getLocale(getState());

  return {
    onConnect() {
      dispatch(connectTimeline(timelineId));
    },

    onDisconnect() {
      dispatch(disconnectTimeline(timelineId));
    },

    onReceive(data: any) {
      switch (data.event) {
        case 'update':
          dispatch(processTimelineUpdate(timelineId, JSON.parse(data.payload), accept));
          break;
        case 'status.update':
          dispatch(updateStatus(JSON.parse(data.payload)));
          break;
        // FIXME: We think delete & redraft is causing jumpy timelines.
        // Fix that in ScrollableList then re-enable this!
        //
        // case 'delete':
        //   dispatch(deleteFromTimelines(data.payload));
        //   break;
        case 'notification':
          messages[locale]().then(messages => {
            dispatch(updateNotificationsQueue(JSON.parse(data.payload), messages, locale, window.location.pathname));
          }).catch(error => {
            console.error(error);
          });
          break;
        case 'conversation':
          dispatch(updateConversations(JSON.parse(data.payload)));
          break;
        case 'filters_changed':
          dispatch(fetchFilters());
          break;
        case 'pleroma:chat_update':
        case 'chat_message.created': // TruthSocial
          dispatch((dispatch: AppDispatch, getState: () => RootState) => {
            const chat = JSON.parse(data.payload);
            const me = getState().me;
            const messageOwned = chat.last_message?.account_id === me;

            // Don't update own messages from streaming
            if (!messageOwned) {
              updateChat(chat);
              play(soundCache.chat);
            }
          });
          break;
        case 'chat_message.deleted': // TruthSocial
          removeChatMessage(data.payload);
          break;
        case 'pleroma:follow_relationships_update':
          dispatch(updateFollowRelationships(JSON.parse(data.payload)));
          break;
        case 'announcement':
          dispatch(updateAnnouncements(JSON.parse(data.payload)));
          break;
        case 'announcement.reaction':
          dispatch(updateAnnouncementsReaction(JSON.parse(data.payload)));
          break;
        case 'announcement.delete':
          dispatch(deleteAnnouncement(data.payload));
          break;
        case 'marker':
          dispatch({ type: MARKER_FETCH_SUCCESS, marker: JSON.parse(data.payload) });
          break;
      }
    },
  };
});

const refreshHomeTimelineAndNotification = (dispatch: AppDispatch, done?: () => void) =>
  dispatch(expandHomeTimeline({}, () =>
    dispatch(expandNotifications({}, () =>
      dispatch(fetchAnnouncements(done))))));

const connectUserStream      = () =>
  connectTimelineStream('home', 'user', refreshHomeTimelineAndNotification);

const connectCommunityStream = ({ onlyMedia }: Record<string, any> = {}) =>
  connectTimelineStream(`community${onlyMedia ? ':media' : ''}`, `public:local${onlyMedia ? ':media' : ''}`);

const connectPublicStream    = ({ onlyMedia }: Record<string, any> = {}) =>
  connectTimelineStream(`public${onlyMedia ? ':media' : ''}`, `public${onlyMedia ? ':media' : ''}`);

const connectRemoteStream    = (instance: string, { onlyMedia }: Record<string, any> = {}) =>
  connectTimelineStream(`remote${onlyMedia ? ':media' : ''}:${instance}`, `public:remote${onlyMedia ? ':media' : ''}&instance=${instance}`);

const connectHashtagStream   = (id: string, tag: string, accept: (status: APIEntity) => boolean) =>
  connectTimelineStream(`hashtag:${id}`, `hashtag&tag=${tag}`, null, accept);

const connectDirectStream    = () =>
  connectTimelineStream('direct', 'direct');

const connectListStream      = (id: string) =>
  connectTimelineStream(`list:${id}`, `list&list=${id}`);

const connectGroupStream     = (id: string) =>
  connectTimelineStream(`group:${id}`, `group&group=${id}`);

export {
  STREAMING_CHAT_UPDATE,
  STREAMING_FOLLOW_RELATIONSHIPS_UPDATE,
  connectTimelineStream,
  connectUserStream,
  connectCommunityStream,
  connectPublicStream,
  connectRemoteStream,
  connectHashtagStream,
  connectDirectStream,
  connectListStream,
  connectGroupStream,
};

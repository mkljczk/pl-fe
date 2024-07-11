import { getLocale, getSettings } from 'soapbox/actions/settings';
import { updateReactions } from 'soapbox/api/hooks/announcements/useAnnouncements';
import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { selectEntity } from 'soapbox/entity-store/selectors';
import messages from 'soapbox/messages';
import { queryClient } from 'soapbox/queries/client';
import { announcementSchema, type Announcement, type Relationship } from 'soapbox/schemas';
import { getUnreadChatsCount, updateChatListItem } from 'soapbox/utils/chats';
import { play, soundCache } from 'soapbox/utils/sounds';

import { connectStream } from '../stream';

import { updateConversations } from './conversations';
import { fetchFilters } from './filters';
import { MARKER_FETCH_SUCCESS } from './markers';
import { updateNotificationsQueue } from './notifications';
import { updateStatus } from './statuses';
import {
  // deleteFromTimelines,
  connectTimeline,
  disconnectTimeline,
  processTimelineUpdate,
} from './timelines';

import type { IntlShape } from 'react-intl';
import type { IStatContext } from 'soapbox/contexts/stat-context';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const updateAnnouncementReactions = ({ announcement_id: id, name, count }: APIEntity) => {
  queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
    prevResult.map(value => {
      if (value.id !== id) return value;

      return announcementSchema.parse({
        ...value,
        reactions: updateReactions(value.reactions, name, -1, true),
      });
    }),
  );
};

const updateAnnouncement = (announcement: APIEntity) =>
  queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) => {
    let updated = false;

    const result = prevResult.map(value => value.id === announcement.id
      ? (updated = true, announcementSchema.parse(announcement))
      : value);

    if (!updated) return [announcementSchema.parse(announcement), ...result];
  });

const deleteAnnouncement = (id: string) =>
  queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
    prevResult.filter(value => value.id !== id),
  );

interface TimelineStreamOpts {
  statContext?: IStatContext;
  enabled?: boolean;
}

const connectTimelineStream = (
  timelineId: string,
  path: string,
  pollingRefresh: ((dispatch: AppDispatch, intl?: IntlShape, done?: () => void) => void) | null = null,
  accept: ((status: APIEntity) => boolean) | null = null,
  opts?: TimelineStreamOpts,
) => connectStream(path, pollingRefresh, (dispatch: AppDispatch, getState: () => RootState) => {
  const locale = getLocale(getState());

  return {
    onConnect() {
      dispatch(connectTimeline(timelineId));
    },

    onDisconnect() {
      dispatch(disconnectTimeline(timelineId));
    },

    onReceive(websocket, data: any) {
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
            dispatch(
              updateNotificationsQueue(
                JSON.parse(data.payload),
                messages,
                locale,
                window.location.pathname,
              ),
            );
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
          dispatch((_dispatch: AppDispatch, getState: () => RootState) => {
            const chat = JSON.parse(data.payload);
            const me = getState().me;
            const messageOwned = chat.last_message?.account_id === me;
            const settings = getSettings(getState());

            // Don't update own messages from streaming
            if (!messageOwned) {
              updateChatListItem(chat);

              if (settings.getIn(['chats', 'sound'])) {
                play(soundCache.chat);
              }

              // Increment unread counter
              opts?.statContext?.setUnreadChatsCount(getUnreadChatsCount());
            }
          });
          break;
        case 'pleroma:follow_relationships_update':
          dispatch(updateFollowRelationships(JSON.parse(data.payload)));
          break;
        case 'announcement':
          updateAnnouncement(JSON.parse(data.payload));
          break;
        case 'announcement.reaction':
          updateAnnouncementReactions(JSON.parse(data.payload));
          break;
        case 'announcement.delete':
          deleteAnnouncement(data.payload);
          break;
        case 'marker':
          dispatch({ type: MARKER_FETCH_SUCCESS, marker: JSON.parse(data.payload) });
          break;
      }
    },
  };
});

const followStateToRelationship = (followState: string) => {
  switch (followState) {
    case 'follow_pending':
      return { following: false, requested: true };
    case 'follow_accept':
      return { following: true, requested: false };
    case 'follow_reject':
      return { following: false, requested: false };
    default:
      return {};
  }
};

interface FollowUpdate {
  state: 'follow_pending' | 'follow_accept' | 'follow_reject';
  follower: {
    id: string;
    follower_count: number;
    following_count: number;
  };
  following: {
    id: string;
    follower_count: number;
    following_count: number;
  };
}

const updateFollowRelationships = (update: FollowUpdate) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const me = getState().me;
    const relationship = selectEntity<Relationship>(getState(), Entities.RELATIONSHIPS, update.following.id);

    if (update.follower.id === me && relationship) {
      const updated = {
        ...relationship,
        ...followStateToRelationship(update.state),
      };

      // Add a small delay to deal with API race conditions.
      setTimeout(() => dispatch(importEntities([updated], Entities.RELATIONSHIPS)), 300);
    }
  };

export {
  connectTimelineStream,
  type TimelineStreamOpts,
};

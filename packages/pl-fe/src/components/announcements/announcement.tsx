import React from 'react';
import { FormattedDate } from 'react-intl';

import { Stack, Text } from 'pl-fe/components/ui';
import { useFeatures } from 'pl-fe/hooks';
import { getTextDirection } from 'pl-fe/utils/rtl';

import AnnouncementContent from './announcement-content';
import ReactionsBar from './reactions-bar';

import type { Map as ImmutableMap } from 'immutable';
import type { CustomEmoji } from 'pl-api';
import type { Announcement as AnnouncementEntity } from 'pl-fe/normalizers';

interface IAnnouncement {
  announcement: AnnouncementEntity;
  emojiMap: ImmutableMap<string, CustomEmoji>;
}

const Announcement: React.FC<IAnnouncement> = ({ announcement, emojiMap }) => {
  const features = useFeatures();

  const startsAt = announcement.starts_at && new Date(announcement.starts_at);
  const endsAt = announcement.ends_at && new Date(announcement.ends_at);
  const now = new Date();
  const hasTimeRange = startsAt && endsAt;
  const skipYear = hasTimeRange && startsAt.getFullYear() === endsAt.getFullYear() && endsAt.getFullYear() === now.getFullYear();
  const skipEndDate = hasTimeRange && startsAt.getDate() === endsAt.getDate() && startsAt.getMonth() === endsAt.getMonth() && startsAt.getFullYear() === endsAt.getFullYear();
  const skipTime = announcement.all_day;
  const direction = getTextDirection(announcement.content);

  return (
    <Stack className='w-full' space={2}>
      {hasTimeRange && (
        <Text theme='muted' direction={direction}>
          <FormattedDate
            value={startsAt}
            hour12
            year={(skipYear || startsAt.getFullYear() === now.getFullYear()) ? undefined : 'numeric'}
            month='short'
            day='2-digit'
            hour={skipTime ? undefined : 'numeric'}
            minute={skipTime ? undefined : '2-digit'}
          />
          {' '}
          -
          {' '}
          <FormattedDate
            value={endsAt}
            hour12
            year={(skipYear || endsAt.getFullYear() === now.getFullYear()) ? undefined : 'numeric'}
            month={skipEndDate ? undefined : 'short'}
            day={skipEndDate ? undefined : '2-digit'}
            hour={skipTime ? undefined : 'numeric'}
            minute={skipTime ? undefined : '2-digit'}
          />
        </Text>
      )}

      <AnnouncementContent announcement={announcement} />

      {features.announcementsReactions && (
        <ReactionsBar
          reactions={announcement.reactions}
          announcementId={announcement.id}
          emojiMap={emojiMap}
        />
      )}
    </Stack>
  );
};

export { Announcement as default };

import emojify from 'pl-fe/features/emoji';
import { makeCustomEmojiMap } from 'pl-fe/schemas/utils';

import type { AdminAnnouncement as BaseAdminAnnouncement, Announcement as BaseAnnouncement } from 'pl-api';

const normalizeAnnouncement = <T extends BaseAnnouncement = BaseAnnouncement>(announcement: T) => {
  const emojiMap = makeCustomEmojiMap(announcement.emojis);

  const contentHtml = emojify(announcement.content, emojiMap);

  return {
    ...announcement,
    contentHtml,
  };
};

type Announcement = ReturnType<typeof normalizeAnnouncement>;
type AdminAnnouncement = ReturnType<typeof normalizeAnnouncement<BaseAdminAnnouncement>>;

export { normalizeAnnouncement, type AdminAnnouncement, type Announcement };

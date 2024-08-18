import emojify from 'soapbox/features/emoji';
import { makeCustomEmojiMap } from 'soapbox/schemas/utils';

import type { Announcement as BaseAnnouncement } from 'pl-api';

const normalizeAnnouncement = (announcement: BaseAnnouncement) => {
  const emojiMap = makeCustomEmojiMap(announcement.emojis);

  const contentHtml = emojify(announcement.content, emojiMap);

  return {
    ...announcement,
    contentHtml,
  };
};

type Announcement = ReturnType<typeof normalizeAnnouncement>;

export { normalizeAnnouncement, type Announcement };

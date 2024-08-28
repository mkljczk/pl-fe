import { announcementSchema } from 'pl-api';
import { z } from 'zod';

import emojify from 'soapbox/features/emoji';

import { makeCustomEmojiMap } from './utils';

import type { Resolve } from 'soapbox/utils/types';

const transformAnnouncement = (announcement: Resolve<z.infer<typeof announcementSchema>>) => {
  const emojiMap = makeCustomEmojiMap(announcement.emojis);

  const contentHtml = emojify(announcement.content, emojiMap);

  return {
    ...announcement,
    contentHtml,
  };
};

const adminAnnouncementSchema = announcementSchema.extend({
  pleroma: z.object({
    raw_content: z.string().catch(''),
  }),
}).transform(transformAnnouncement);

type AdminAnnouncement = Resolve<z.infer<typeof adminAnnouncementSchema>>;

export { adminAnnouncementSchema, type AdminAnnouncement };

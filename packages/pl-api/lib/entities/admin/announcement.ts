import pick from 'lodash.pick';
import { z } from 'zod';

import { announcementSchema } from '../announcement';

/** @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminannouncements} */
const adminAnnouncementSchema = z.preprocess((announcement: any) => ({
  ...announcement,
  ...pick(announcement.pleroma, 'raw_content'),
}), announcementSchema.extend({
  raw_content: z.string().catch(''),
}));

type AdminAnnouncement = z.infer<typeof adminAnnouncementSchema>;

export { adminAnnouncementSchema, type AdminAnnouncement };

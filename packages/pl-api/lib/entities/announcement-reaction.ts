import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/announcement/} */
const announcementReactionSchema = v.object({
  name: v.fallback(v.string(), ''),
  count: z.number().int().nonnegative().catch(0),
  me: v.fallback(v.boolean(), false),
  url: v.fallback(v.nullable(v.string()), null),
  static_url: v.fallback(v.nullable(v.string()), null),
  announcement_id: v.fallback(v.string(), ''),
});

type AnnouncementReaction = v.InferOutput<typeof announcementReactionSchema>;

export { announcementReactionSchema, type AnnouncementReaction };

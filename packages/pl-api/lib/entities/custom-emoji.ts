import z from 'zod';

/**
 * Represents a custom emoji.
 * @see {@link https://docs.joinmastodon.org/entities/CustomEmoji/}
 */
const customEmojiSchema = z.object({
  shortcode: z.string(),
  url: z.string(),
  static_url: z.string().catch(''),
  visible_in_picker: z.boolean().catch(true),
  category: z.string().nullable().catch(null),
});

type CustomEmoji = z.infer<typeof customEmojiSchema>;

export { customEmojiSchema, type CustomEmoji };

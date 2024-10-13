import pick from 'lodash.pick';
import * as v from 'valibot';

import { customEmojiSchema } from './custom-emoji';
import { relationshipSchema } from './relationship';
import { roleSchema } from './role';
import { coerceObject, dateSchema, filteredArray } from './utils';

const filterBadges = (tags?: string[]) =>
  tags?.filter(tag => tag.startsWith('badge:')).map(tag => roleSchema.parse({ id: tag, name: tag.replace(/^badge:/, '') }));

const preprocessAccount = (account: any) => {
  if (!account?.acct) return null;

  const username = account.username || account.acct.split('@')[0];

  return {
    username,
    avatar_static: account.avatar_static || account.avatar,
    header_static: account.header_static || account.header,
    local: typeof account.pleroma?.is_local === 'boolean' ? account.pleroma.is_local : account.acct.split('@')[1] === undefined,
    discoverable: account.discoverable || account.pleroma?.source?.discoverable,
    verified: account.verified || account.pleroma?.tags?.includes('verified'),
    ...(pick(account.pleroma || {}, [
      'ap_id',
      'background_image',
      'relationship',
      'is_moderator',
      'is_admin',
      'hide_favorites',
      'hide_followers',
      'hide_follows',
      'hide_followers_count',
      'hide_follows_count',
      'accepts_chat_messages',
      'favicon',
      'birthday',
      'deactivated',
      'avatar_description',
      'header_description',

      'settings_store',
      'chat_token',
      'allow_following_move',
      'unread_conversation_count',
      'unread_notifications_count',
      'notification_settings',

      'location',
    ])),
    ...(pick(account.other_settings || {}), ['birthday', 'location']),
    __meta: pick(account, ['pleroma', 'source']),
    ...account,
    display_name: account.display_name?.trim() || username,
    roles: account.roles?.length ? account.roles : filterBadges(account.pleroma?.tags),
    source: account.source
      ? { ...(pick(account.pleroma?.source || {}, [
        'show_role', 'no_rich_text', 'discoverable', 'actor_type', 'show_birthday',
      ])), ...account.source }
      : undefined,
  };
};

const fieldSchema = v.object({
  name: v.string(),
  value: v.string(),
  verified_at: z.string().datetime({ offset: true }).nullable().catch(null),
});

const baseAccountSchema = v.object({
  id: v.string(),
  username: v.fallback(v.string(), ''),
  acct: v.fallback(v.string(), ''),
  url: z.string().url(),
  display_name: v.fallback(v.string(), ''),
  note: v.fallback(v.string(), ''),
  avatar: v.fallback(v.string(), ''),
  avatar_static: z.string().url().catch(''),
  header: z.string().url().catch(''),
  header_static: z.string().url().catch(''),
  locked: v.fallback(v.boolean(), false),
  fields: filteredArray(fieldSchema),
  emojis: filteredArray(customEmojiSchema),
  bot: v.fallback(v.boolean(), false),
  group: v.fallback(v.boolean(), false),
  discoverable: v.fallback(v.boolean(), false),
  noindex: v.fallback(v.optional(v.nullable()), null),
  suspended: v.fallback(v.optional(v.boolean()), undefined),
  limited: v.fallback(v.optional(v.boolean()), undefined),
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  last_status_at: z.string().date().nullable().catch(null),
  statuses_count: v.fallback(v.number(), 0),
  followers_count: v.fallback(v.number(), 0),
  following_count: v.fallback(v.number(), 0),
  roles: filteredArray(roleSchema),

  fqn: v.fallback(v.nullable(v.string()), null),
  ap_id: v.fallback(v.nullable(v.string()), null),
  background_image: v.fallback(v.nullable(v.string()), null),
  relationship: relationshipSchema.optional().catch(undefined),
  is_moderator: v.fallback(v.optional(v.boolean()), undefined),
  is_admin: v.fallback(v.optional(v.boolean()), undefined),
  is_suggested: v.fallback(v.optional(v.boolean()), undefined),
  hide_favorites: v.fallback(v.boolean(), true),
  hide_followers: v.fallback(v.optional(v.boolean()), undefined),
  hide_follows: v.fallback(v.optional(v.boolean()), undefined),
  hide_followers_count: v.fallback(v.optional(v.boolean()), undefined),
  hide_follows_count: v.fallback(v.optional(v.boolean()), undefined),
  accepts_chat_messages: v.fallback(v.optional(v.nullable()), null),
  favicon: v.fallback(v.optional(v.string()), undefined),
  birthday: z.string().date().optional().catch(undefined),
  deactivated: v.fallback(v.optional(v.boolean()), undefined),

  location: v.fallback(v.optional(v.string()), undefined),
  local: z.boolean().optional().catch(false),

  avatar_description: v.fallback(v.string(), ''),
  enable_rss: v.fallback(v.boolean(), false),
  header_description: v.fallback(v.string(), ''),

  verified: v.fallback(v.optional(v.boolean()), undefined),

  __meta: coerceObject({
    pleroma: z.any().optional().catch(undefined),
    source: z.any().optional().catch(undefined),
  }),
});

const accountWithMovedAccountSchema = baseAccountSchema.extend({
  moved: z.lazy((): typeof baseAccountSchema => accountWithMovedAccountSchema as any).nullable().catch(null),
});

/** @see {@link https://docs.joinmastodon.org/entities/Account/} */
const untypedAccountSchema = z.preprocess(preprocessAccount, accountWithMovedAccountSchema);

type WithMoved = {
  moved: Account | null;
};

type Account = v.InferOutput<typeof accountWithMovedAccountSchema> & WithMoved;

const accountSchema: z.ZodType<Account> = untypedAccountSchema as any;

const untypedCredentialAccountSchema = z.preprocess(preprocessAccount, accountWithMovedAccountSchema.extend({
  source: v.object({
    note: v.fallback(v.string(), ''),
    fields: filteredArray(fieldSchema),
    privacy: z.enum(['public', 'unlisted', 'private', 'direct']),
    sensitive: v.fallback(v.boolean(), false),
    language: v.fallback(v.nullable(v.string()), null),
    follow_requests_count: z.number().int().nonnegative().catch(0),

    show_role: z.boolean().optional().nullable().catch(undefined),
    no_rich_text: z.boolean().optional().nullable().catch(undefined),
    discoverable: v.fallback(v.optional(v.boolean()), undefined),
    actor_type: v.fallback(v.optional(v.string()), undefined),
    show_birthday: v.fallback(v.optional(v.boolean()), undefined),
  }).nullable().catch(null),
  role: v.fallback(v.nullable(roleSchema), null),

  settings_store: z.record(z.any()).optional().catch(undefined),
  chat_token: v.fallback(v.optional(v.string()), undefined),
  allow_following_move: v.fallback(v.optional(v.boolean()), undefined),
  unread_conversation_count: z.number().optional().catch(undefined),
  unread_notifications_count: z.number().optional().catch(undefined),
  notification_settings: v.object({
    block_from_strangers: v.fallback(v.boolean(), false),
    hide_notification_contents: v.fallback(v.boolean(), false),
  }).optional().catch(undefined),
}));

type CredentialAccount = v.InferOutput<typeof untypedCredentialAccountSchema> & WithMoved;

const credentialAccountSchema: z.ZodType<CredentialAccount> = untypedCredentialAccountSchema as any;

const untypedMutedAccountSchema = z.preprocess(preprocessAccount, accountWithMovedAccountSchema.extend({
  mute_expires_at: v.fallback(v.nullable(dateSchema), null),
}));

type MutedAccount = v.InferOutput<typeof untypedMutedAccountSchema> & WithMoved;

const mutedAccountSchema: z.ZodType<MutedAccount> = untypedMutedAccountSchema as any;

export {
  accountSchema,
  credentialAccountSchema,
  mutedAccountSchema,
  type Account,
  type CredentialAccount,
  type MutedAccount,
};

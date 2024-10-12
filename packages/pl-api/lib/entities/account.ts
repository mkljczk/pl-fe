import pick from 'lodash.pick';
import z from 'zod';

import { customEmojiSchema } from './custom-emoji';
import { relationshipSchema } from './relationship';
import { roleSchema } from './role';
import { coerceObject, dateSchema, filteredArray } from './utils';

const getDomainFromURL = (account: Pick<Account, 'url'>): string => {
  try {
    const url = account.url;
    return new URL(url).host;
  } catch {
    return '';
  }
};

const guessFqn = (account: Pick<Account, 'acct' | 'url'>): string => {
  const acct = account.acct;
  const [user, domain] = acct.split('@');

  if (domain) {
    return acct;
  } else {
    return [user, getDomainFromURL(account)].join('@');
  }
};

const filterBadges = (tags?: string[]) =>
  tags?.filter(tag => tag.startsWith('badge:')).map(tag => roleSchema.parse({ id: tag, name: tag.replace(/^badge:/, '') }));

const preprocessAccount = (account: any) => {
  if (!account?.acct) return null;

  const username = account.username || account.acct.split('@')[0];
  const fqn = guessFqn(account);

  return {
    username,
    fqn,
    domain: fqn.split('@')[1] || '',
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

const fieldSchema = z.object({
  name: z.string(),
  value: z.string(),
  verified_at: z.string().datetime({ offset: true }).nullable().catch(null),
});

const baseAccountSchema = z.object({
  id: z.string(),
  username: z.string().catch(''),
  acct: z.string().catch(''),
  url: z.string().url(),
  display_name: z.string().catch(''),
  note: z.string().transform(note => note === '<p></p>' ? '' : note).catch(''),
  avatar: z.string().catch(''),
  avatar_static: z.string().url().catch(''),
  header: z.string().url().catch(''),
  header_static: z.string().url().catch(''),
  locked: z.boolean().catch(false),
  fields: filteredArray(fieldSchema),
  emojis: filteredArray(customEmojiSchema),
  bot: z.boolean().catch(false),
  group: z.boolean().catch(false),
  discoverable: z.boolean().catch(false),
  noindex: z.boolean().nullable().catch(null),
  moved: z.null().catch(null),
  suspended: z.boolean().optional().catch(undefined),
  limited: z.boolean().optional().catch(undefined),
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  last_status_at: z.string().date().nullable().catch(null),
  statuses_count: z.number().catch(0),
  followers_count: z.number().catch(0),
  following_count: z.number().catch(0),
  roles: filteredArray(roleSchema),

  fqn: z.string().nullable().catch(null),
  ap_id: z.string().nullable().catch(null),
  background_image: z.string().nullable().catch(null),
  relationship: relationshipSchema.optional().catch(undefined),
  is_moderator: z.boolean().optional().catch(undefined),
  is_admin: z.boolean().optional().catch(undefined),
  is_suggested: z.boolean().optional().catch(undefined),
  hide_favorites: z.boolean().catch(true),
  hide_followers: z.boolean().optional().catch(undefined),
  hide_follows: z.boolean().optional().catch(undefined),
  hide_followers_count: z.boolean().optional().catch(undefined),
  hide_follows_count: z.boolean().optional().catch(undefined),
  accepts_chat_messages: z.boolean().nullable().catch(null),
  favicon: z.string().optional().catch(undefined),
  birthday: z.string().date().optional().catch(undefined),
  deactivated: z.boolean().optional().catch(undefined),

  location: z.string().optional().catch(undefined),
  local: z.boolean().optional().catch(false),

  avatar_description: z.string().catch(''),
  enable_rss: z.boolean().catch(false),
  header_description: z.string().catch(''),

  verified: z.boolean().optional().catch(undefined),
  domain: z.string().catch(''),

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

type Account = z.infer<typeof accountWithMovedAccountSchema> & WithMoved;

const accountSchema: z.ZodType<Account> = untypedAccountSchema as any;

const untypedCredentialAccountSchema = z.preprocess(preprocessAccount, accountWithMovedAccountSchema.extend({
  source: z.object({
    note: z.string().catch(''),
    fields: filteredArray(fieldSchema),
    privacy: z.enum(['public', 'unlisted', 'private', 'direct']),
    sensitive: z.boolean().catch(false),
    language: z.string().nullable().catch(null),
    follow_requests_count: z.number().int().nonnegative().catch(0),

    show_role: z.boolean().optional().nullable().catch(undefined),
    no_rich_text: z.boolean().optional().nullable().catch(undefined),
    discoverable: z.boolean().optional().catch(undefined),
    actor_type: z.string().optional().catch(undefined),
    show_birthday: z.boolean().optional().catch(undefined),
  }).nullable().catch(null),
  role: roleSchema.nullable().catch(null),

  settings_store: z.record(z.any()).optional().catch(undefined),
  chat_token: z.string().optional().catch(undefined),
  allow_following_move: z.boolean().optional().catch(undefined),
  unread_conversation_count: z.number().optional().catch(undefined),
  unread_notifications_count: z.number().optional().catch(undefined),
  notification_settings: z.object({
    block_from_strangers: z.boolean().catch(false),
    hide_notification_contents: z.boolean().catch(false),
  }).optional().catch(undefined),
}));

type CredentialAccount = z.infer<typeof untypedCredentialAccountSchema> & WithMoved;

const credentialAccountSchema: z.ZodType<CredentialAccount> = untypedCredentialAccountSchema as any;

const untypedMutedAccountSchema = z.preprocess(preprocessAccount, accountWithMovedAccountSchema.extend({
  mute_expires_at: dateSchema.nullable().catch(null),
}));

type MutedAccount = z.infer<typeof untypedMutedAccountSchema> & WithMoved;

const mutedAccountSchema: z.ZodType<MutedAccount> = untypedMutedAccountSchema as any;

export {
  accountSchema,
  credentialAccountSchema,
  mutedAccountSchema,
  type Account,
  type CredentialAccount,
  type MutedAccount,
};

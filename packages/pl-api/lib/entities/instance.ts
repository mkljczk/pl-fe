/* eslint sort-keys: "error" */
import z from 'zod';

import { accountSchema } from './account';
import { ruleSchema } from './rule';
import { coerceObject, filteredArray, mimeSchema } from './utils';

const getApiVersions = (instance: any) => ({
  ...Object.fromEntries(instance.pleroma?.metadata?.features?.map((feature: string) => {
    let string = `${feature}.pleroma.pl-api`;
    if (string.startsWith('pleroma:') || string.startsWith('pleroma_')) string = string.slice(8);
    if (string.startsWith('akkoma:')) string = string.slice(7);
    if (string.startsWith('pl:')) string = string.slice(3);
    return [string, 1];
  }) || []),
  ...Object.fromEntries(instance.fedibird_capabilities?.map((feature: string) => [`${feature}.fedibird.pl-api`, 1]) || []),
  ...instance.api_versions,
});

const instanceV1ToV2 = (data: any) => {
  const {
    approval_required,
    configuration,
    contact_account,
    description,
    description_limit,
    email,
    max_media_attachments,
    max_toot_chars,
    poll_limits,
    pleroma,
    registrations,
    short_description,
    thumbnail,
    upload_limit,
    uri,
    urls,
    ...instance
  } = instanceV1Schema.parse(data);

  return {
    ...instance,
    account_domain: instance.account_domain	|| uri,
    configuration: {
      ...configuration,
      media_attachments: {
        ...configuration.media_attachments,
        image_size_limit: upload_limit ?? configuration.media_attachments.image_size_limit,
        video_size_limit: upload_limit ?? configuration.media_attachments.video_size_limit,
      },
      polls: {
        ...configuration.polls,
        max_characters_per_option: poll_limits.max_option_chars ?? configuration.polls.max_characters_per_option,
        max_expiration: poll_limits.max_expiration ?? configuration.polls.max_expiration,
        max_options: poll_limits.max_options ?? configuration.polls.max_options,
        min_expiration: poll_limits.min_expiration ?? configuration.polls.min_expiration,
      },
      statuses: {
        ...configuration.statuses,
        max_characters: max_toot_chars ?? configuration.statuses.max_characters,
        max_media_attachments: max_media_attachments ?? configuration.statuses.max_media_attachments,
      },
      urls: {
        streaming: urls.streaming_api,
      },
      vapid: {
        public_key: pleroma.vapid_public_key,
      },
    },
    contact: {
      account: contact_account,
      email: email,
    },
    description: short_description || description,
    domain: uri,
    pleroma: {
      ...pleroma,
      metadata: {
        ...pleroma.metadata,
        description_limit,
      },
    },
    registrations: {
      approval_required: approval_required,
      enabled: registrations,
    },
    thumbnail: { url: thumbnail },
  };
};

const fixVersion = (version: string) => {
  // Handle Mastodon release candidates
  if (new RegExp(/[0-9.]+rc[0-9]+/g).test(version)) {
    version = version.split('rc').join('-rc');
  }

  // Rename Akkoma to Pleroma+akkoma
  if (version.includes('Akkoma')) {
    version = '2.7.2 (compatible; Pleroma 2.4.50+akkoma)';
  }

  // Set Takahē version to a Pleroma-like string
  if (version.startsWith('takahe/')) {
    version = `0.0.0 (compatible; Takahe ${version.slice(7)})`;
  }

  return version;
};

const configurationSchema = coerceObject({
  accounts: z.object({
    allow_custom_css: z.boolean(),
    max_featured_tags: z.number().int(),
    max_profile_fields: z.number().int(),
  }).nullable().catch(null),
  chats: coerceObject({
    max_characters: z.number().catch(5000),
  }),
  groups: coerceObject({
    max_characters_description: z.number().catch(160),
    max_characters_name: z.number().catch(50),
  }),
  media_attachments: coerceObject({
    image_matrix_limit: z.number().optional().catch(undefined),
    image_size_limit: z.number().optional().catch(undefined),
    supported_mime_types: mimeSchema.array().optional().catch(undefined),
    video_duration_limit: z.number().optional().catch(undefined),
    video_frame_rate_limit: z.number().optional().catch(undefined),
    video_matrix_limit: z.number().optional().catch(undefined),
    video_size_limit: z.number().optional().catch(undefined),
  }),
  polls: coerceObject({
    max_characters_per_option: z.number().catch(25),
    max_expiration: z.number().catch(2629746),
    max_options: z.number().catch(4),
    min_expiration: z.number().catch(300),
  }),
  reactions: coerceObject({
    max_reactions: z.number().catch(0),
  }),
  statuses: coerceObject({
    characters_reserved_per_url: z.number().optional().catch(undefined),
    max_characters: z.number().catch(500),
    max_media_attachments: z.number().catch(4),

  }),
  translation: coerceObject({
    enabled: z.boolean().catch(false),
  }),
  urls: coerceObject({
    streaming: z.string().url().optional().catch(undefined),
  }),
  vapid: coerceObject({
    public_key: z.string().catch(''),
  }),
});

const contactSchema = coerceObject({
  contact_account: accountSchema.optional().catch(undefined),
  email: z.string().email().catch(''),
});

const pleromaSchema = coerceObject({
  metadata: coerceObject({
    account_activation_required: z.boolean().catch(false),
    birthday_min_age: z.number().catch(0),
    birthday_required: z.boolean().catch(false),
    description_limit: z.number().catch(1500),
    features: z.string().array().catch([]),
    federation: coerceObject({
      enabled: z.boolean().catch(true), // Assume true unless explicitly false
      mrf_policies: z.string().array().optional().catch(undefined),
      mrf_simple: coerceObject({
        accept: z.string().array().catch([]),
        avatar_removal: z.string().array().catch([]),
        banner_removal: z.string().array().catch([]),
        federated_timeline_removal: z.string().array().catch([]),
        followers_only: z.string().array().catch([]),
        media_nsfw: z.string().array().catch([]),
        media_removal: z.string().array().catch([]),
        reject: z.string().array().catch([]),
        reject_deletes: z.string().array().catch([]),
        report_removal: z.string().array().catch([]),
      }),
    }),
    fields_limits: coerceObject({
      max_fields: z.number().nonnegative().catch(4),
      name_length: z.number().nonnegative().catch(255),
      value_length: z.number().nonnegative().catch(2047),
    }),
    markup: coerceObject({
      allow_headings: z.boolean().catch(false),
      allow_inline_images: z.boolean().catch(false),
    }),
    migration_cooldown_period: z.number().optional().catch(undefined),
    multitenancy: coerceObject({
      domains: z
        .array(
          z.object({
            domain: z.coerce.string(),
            id: z.string(),
            public: z.boolean().catch(false),
          }),
        )
        .optional(),
      enabled: z.boolean().catch(false),
    }),
    post_formats: z.string().array().optional().catch(undefined),
    restrict_unauthenticated: coerceObject({
      activities: coerceObject({
        local: z.boolean().catch(false),
        remote: z.boolean().catch(false),
      }),
      profiles: coerceObject({
        local: z.boolean().catch(false),
        remote: z.boolean().catch(false),
      }),
      timelines: coerceObject({
        bubble: z.boolean().catch(false),
        federated: z.boolean().catch(false),
        local: z.boolean().catch(false),
      }),
    }),
    translation: coerceObject({
      allow_remote: z.boolean().catch(true),
      allow_unauthenticated: z.boolean().catch(false),
      source_languages: z.string().array().optional().catch(undefined),
      target_languages: z.string().array().optional().catch(undefined),
    }),
  }),
  oauth_consumer_strategies: z.string().array().catch([]),
  stats: coerceObject({
    mau: z.number().optional().catch(undefined),
  }),
  vapid_public_key: z.string().catch(''),
});

const pleromaPollLimitsSchema = coerceObject({
  max_expiration: z.number().optional().catch(undefined),
  max_option_chars: z.number().optional().catch(undefined),
  max_options: z.number().optional().catch(undefined),
  min_expiration: z.number().optional().catch(undefined),
});

const registrations = coerceObject({
  approval_required: z.boolean().catch(false),
  enabled: z.boolean().catch(false),
  message: z.string().optional().catch(undefined),
});

const statsSchema = coerceObject({
  domain_count: z.number().optional().catch(undefined),
  status_count: z.number().optional().catch(undefined),
  user_count: z.number().optional().catch(undefined),
});

const thumbnailSchema = coerceObject({
  url: z.string().catch(''),
});

const usageSchema = coerceObject({
  users: coerceObject({
    active_month: z.number().catch(0),
  }),
});

const instanceV1Schema = coerceObject({
  account_domain: z.string().catch(''),
  approval_required: z.boolean().catch(false),
  configuration: configurationSchema,
  contact_account: accountSchema.optional().catch(undefined),
  description: z.string().catch(''),
  description_limit: z.number().catch(1500),
  email: z.string().email().catch(''),
  feature_quote: z.boolean().catch(false),
  fedibird_capabilities: z.array(z.string()).catch([]),
  languages: z.string().array().catch([]),
  max_media_attachments: z.number().optional().catch(undefined),
  max_toot_chars: z.number().optional().catch(undefined),
  pleroma: pleromaSchema,
  poll_limits: pleromaPollLimitsSchema,
  registrations: z.boolean().catch(false),
  rules: filteredArray(ruleSchema),
  short_description: z.string().catch(''),
  stats: statsSchema,
  thumbnail: z.string().catch(''),
  title: z.string().catch(''),
  upload_limit: z.number().optional().catch(undefined),
  uri: z.string().catch(''),
  urls: coerceObject({
    streaming_api: z.string().url().optional().catch(undefined),
  }),
  usage: usageSchema,
  version: z.string().catch('0.0.0'),
});

/** @see {@link https://docs.joinmastodon.org/entities/Instance/} */
const instanceSchema = z.preprocess((data: any) => {
  // Detect GoToSocial
  if (typeof data.configuration?.accounts?.allow_custom_css === 'boolean') {
    data.version = `0.0.0 (compatible; GoToSocial ${data.version})`;
  }

  const apiVersions = getApiVersions(data);

  if (data.domain) return { account_domain: data.domain, ...data, api_versions: apiVersions };

  return instanceV1ToV2({ ...data, api_versions: apiVersions });
}, coerceObject({
  account_domain: z.string().catch(''),
  api_versions: z.record(z.number()).catch({}),
  configuration: configurationSchema,
  contact: contactSchema,
  description: z.string().catch(''),
  domain: z.string().catch(''),
  feature_quote: z.boolean().catch(false),
  fedibird_capabilities: z.array(z.string()).catch([]),
  languages: z.string().array().catch([]),
  pleroma: pleromaSchema,
  registrations: registrations,
  rules: filteredArray(ruleSchema),
  stats: statsSchema,
  thumbnail: thumbnailSchema,
  title: z.string().catch(''),
  usage: usageSchema,
  version: z.string().catch('0.0.0'),
}).transform((instance) => {
  const version = fixVersion(instance.version);

  return {
    ...instance,
    version,
  };
}));

type Instance = z.infer<typeof instanceSchema>;

export { instanceSchema, type Instance };

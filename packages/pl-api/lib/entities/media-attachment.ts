import { isBlurhashValid } from 'blurhash';
import * as v from 'valibot';

import { mimeSchema } from './utils';

const blurhashSchema = z.string().superRefine((value, ctx) => {
  const r = isBlurhashValid(value);

  if (!r.result) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: r.errorReason,
    });
  }
});

const baseAttachmentSchema = v.object({
  id: v.string(),
  type: v.string(),
  url: z.string().url().catch(''),
  preview_url: z.string().url().catch(''),
  remote_url: z.string().url().nullable().catch(null),
  description: v.fallback(v.string(), ''),
  blurhash: v.fallback(v.nullable(blurhashSchema), null),

  mime_type: v.fallback(v.nullable(mimeSchema), null),
});

const imageMetaSchema = v.object({
  width: z.number(),
  height: z.number(),
  size: z.string().regex(/\d+x\d+$/).nullable().catch(null),
  aspect: v.fallback(v.nullable(v.number()), null),
});

const imageAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('image'),
  meta: v.object({
    original: imageMetaSchema.optional().catch(undefined),
    small: imageMetaSchema.optional().catch(undefined),
    focus: v.object({
      x: z.number().min(-1).max(1),
      y: z.number().min(-1).max(1),
    }).optional().catch(undefined),
  }).catch({}),
});

const videoAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('video'),
  meta: v.object({
    duration: z.number().optional().catch(undefined),
    original: imageMetaSchema.extend({
      frame_rate: z.string().regex(/\d+\/\d+$/).nullable().catch(null),
      duration: z.number().nonnegative().nullable().catch(null),
    }).optional().catch(undefined),
    small: imageMetaSchema.optional().catch(undefined),
    // WIP: add rest
  }).catch({}),
});

const gifvAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('gifv'),
  meta: v.object({
    duration: z.number().optional().catch(undefined),
    original: imageMetaSchema.optional().catch(undefined),
  }).catch({}),
});

const audioAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('audio'),
  meta: v.object({
    duration: z.number().optional().catch(undefined),
    colors: v.object({
      background: v.fallback(v.optional(v.string()), undefined),
      foreground: v.fallback(v.optional(v.string()), undefined),
      accent: v.fallback(v.optional(v.string()), undefined),
      duration: z.number().optional().catch(undefined),
    }).optional().catch(undefined),
    original: v.object({
      duration: z.number().optional().catch(undefined),
      bitrate: z.number().nonnegative().optional().catch(undefined),
    }).optional().catch(undefined),
  }).catch({}),
});

const unknownAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('unknown'),
});

/** @see {@link https://docs.joinmastodon.org/entities/MediaAttachment} */
const mediaAttachmentSchema = z.preprocess((data: any) => {
  if (!data) return null;

  return {
    mime_type: data.pleroma?.mime_type,
    preview_url: data.url,
    ...data,
  };
}, z.discriminatedUnion('type', [
  imageAttachmentSchema,
  videoAttachmentSchema,
  gifvAttachmentSchema,
  audioAttachmentSchema,
  unknownAttachmentSchema,
]));

type MediaAttachment = v.InferOutput<typeof mediaAttachmentSchema>;

export { blurhashSchema, mediaAttachmentSchema, type MediaAttachment };

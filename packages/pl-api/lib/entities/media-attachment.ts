import { isBlurhashValid } from 'blurhash';
import { z } from 'zod';

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

const baseAttachmentSchema = z.object({
  id: z.string(),
  type: z.string(),
  url: z.string().url().catch(''),
  preview_url: z.string().url().catch(''),
  remote_url: z.string().url().nullable().catch(null),
  description: z.string().catch(''),
  blurhash: blurhashSchema.nullable().catch(null),

  mime_type: mimeSchema.nullable().catch(null),
});

const imageMetaSchema = z.object({
  width: z.number(),
  height: z.number(),
  size: z.string().regex(/\d+x\d+$/).nullable().catch(null),
  aspect: z.number().nullable().catch(null),
});

const imageAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('image'),
  meta: z.object({
    original: imageMetaSchema.optional().catch(undefined),
    small: imageMetaSchema.optional().catch(undefined),
    focus: z.object({
      x: z.number().min(-1).max(1),
      y: z.number().min(-1).max(1),
    }).optional().catch(undefined),
  }).catch({}),
});

const videoAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('video'),
  meta: z.object({
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
  meta: z.object({
    duration: z.number().optional().catch(undefined),
    original: imageMetaSchema.optional().catch(undefined),
  }).catch({}),
});

const audioAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('audio'),
  meta: z.object({
    duration: z.number().optional().catch(undefined),
    colors: z.object({
      background: z.string().optional().catch(undefined),
      foreground: z.string().optional().catch(undefined),
      accent: z.string().optional().catch(undefined),
      duration: z.number().optional().catch(undefined),
    }).optional().catch(undefined),
    original: z.object({
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

type MediaAttachment = z.infer<typeof mediaAttachmentSchema>;

export { blurhashSchema, mediaAttachmentSchema, type MediaAttachment };

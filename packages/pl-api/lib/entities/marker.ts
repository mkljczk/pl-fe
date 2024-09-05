import { z } from 'zod';

import { dateSchema } from './utils';

const markerSchema = z.preprocess((marker: any) => marker ? ({
  unread_count: marker.pleroma?.unread_count,
  ...marker,
}) : null, z.object({
  last_read_id: z.string(),
  version: z.number().int(),
  updated_at: dateSchema,
  unread_count: z.number().int().optional().catch(undefined),
}));

/** @see {@link https://docs.joinmastodon.org/entities/Marker/} */
type Marker = z.infer<typeof markerSchema>;

const markersSchema = z.record(markerSchema);

type Markers = z.infer<typeof markersSchema>;

export {
  markerSchema,
  markersSchema,
  type Marker,
  type Markers,
};

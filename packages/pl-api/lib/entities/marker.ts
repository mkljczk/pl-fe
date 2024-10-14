import * as v from 'valibot';

import { dateSchema } from './utils';

const markerSchema = z.preprocess((marker: any) => marker ? ({
  unread_count: marker.pleroma?.unread_count,
  ...marker,
}) : null, v.object({
  last_read_id: v.string(),
  version: v.pipe(v.number(), v.integer()),
  updated_at: dateSchema,
  unread_count: z.number().int().optional().catch(undefined),
}));

/** @see {@link https://docs.joinmastodon.org/entities/Marker/} */
type Marker = v.InferOutput<typeof markerSchema>;

const markersSchema = v.record(v.string(), markerSchema);

type Markers = v.InferOutput<typeof markersSchema>;

export {
  markerSchema,
  markersSchema,
  type Marker,
  type Markers,
};

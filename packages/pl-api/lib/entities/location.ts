import * as v from 'valibot';

const locationSchema = v.object({
  url: z.string().url().catch(''),
  description: v.fallback(v.string(), ''),
  country: v.fallback(v.string(), ''),
  locality: v.fallback(v.string(), ''),
  region: v.fallback(v.string(), ''),
  postal_code: v.fallback(v.string(), ''),
  street: v.fallback(v.string(), ''),
  origin_id: v.fallback(v.string(), ''),
  origin_provider: v.fallback(v.string(), ''),
  type: v.fallback(v.string(), ''),
  timezone: v.fallback(v.string(), ''),
  geom: v.object({
    coordinates: z.tuple([z.number(), z.number()]).nullable().catch(null),
    srid: v.fallback(v.string(), ''),
  }).nullable().catch(null),
});

type Location = v.InferOutput<typeof locationSchema>;

export { locationSchema, type Location };

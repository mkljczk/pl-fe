import z from 'zod';

const adminRelaySchema = z.preprocess((data: any) => ({ id: data.actor, ...data }), z.object({
  actor: z.string().catch(''),
  id: z.string(),
  followed_back: z.boolean().catch(false),
}));

type AdminRelay = z.infer<typeof adminRelaySchema>

export { adminRelaySchema, type AdminRelay };

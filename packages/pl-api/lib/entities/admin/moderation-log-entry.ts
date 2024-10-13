import * as v from 'valibot';

/** @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminmoderation_log} */
const adminModerationLogEntrySchema = v.object({
  id: z.coerce.string(),
  data: z.record(v.string(), z.any()).catch({}),
  time: v.fallback(v.number(), 0),
  message: v.fallback(v.string(), ''),
});

type AdminModerationLogEntry = v.InferOutput<typeof adminModerationLogEntrySchema>

export { adminModerationLogEntrySchema, type AdminModerationLogEntry };

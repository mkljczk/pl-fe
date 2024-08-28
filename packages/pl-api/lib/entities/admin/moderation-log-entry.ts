import z from 'zod';

/** @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminmoderation_log} */
const adminModerationLogEntrySchema = z.object({
  id: z.coerce.string(),
  data: z.record(z.string(), z.any()).catch({}),
  time: z.number().catch(0),
  message: z.string().catch(''),
});

type AdminModerationLogEntry = z.infer<typeof adminModerationLogEntrySchema>

export { adminModerationLogEntrySchema, type AdminModerationLogEntry };

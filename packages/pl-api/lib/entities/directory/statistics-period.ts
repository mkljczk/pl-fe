import { z } from 'zod';

const directoryStatisticsPeriodSchema = z.object({
  period: z.string().date(),
  server_count: z.coerce.number().nullable().catch(null),
  user_count: z.coerce.number().nullable().catch(null),
  active_user_count: z.coerce.number().nullable().catch(null),
});

type DirectoryStatisticsPeriod = z.infer<typeof directoryStatisticsPeriodSchema>;

export { directoryStatisticsPeriodSchema, type DirectoryStatisticsPeriod };

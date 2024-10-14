import * as v from 'valibot';

const directoryStatisticsPeriodSchema = v.object({
  period: z.string().date(),
  server_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
  user_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
  active_user_count: v.fallback(v.nullable(v.pipe(v.unknown(), v.transform(Number))), null),
});

type DirectoryStatisticsPeriod = v.InferOutput<typeof directoryStatisticsPeriodSchema>;

export { directoryStatisticsPeriodSchema, type DirectoryStatisticsPeriod };

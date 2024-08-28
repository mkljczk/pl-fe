import type { PlFeEnv } from './build-config-compiletime';

export const {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  FE_INSTANCE_SOURCE_DIR,
  SENTRY_DSN,
} = import.meta.compileTime<PlFeEnv>('./build-config-compiletime.ts');

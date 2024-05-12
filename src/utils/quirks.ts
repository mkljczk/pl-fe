/* eslint sort-keys: "error" */
import { createSelector } from 'reselect';

import { parseVersion, MITRA } from './features';

import type { Instance } from 'soapbox/schemas';

/** For solving bugs between API implementations. */
const getQuirks = createSelector([
  (instance: Instance) => parseVersion(instance.version),
], (v) => ({
  /**
   * Apps are not supported by the API, and should not be created during login or registration.
   * @see POST /api/v1/apps
   * @see POST /oauth/token
   */
  noApps: v.software === MITRA,
}));

export { getQuirks };

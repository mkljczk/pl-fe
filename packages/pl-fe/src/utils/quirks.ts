import { type Instance, MITRA, getFeatures } from 'pl-api';
import { createSelector } from 'reselect';

/** For solving bugs between API implementations. */
const getQuirks = createSelector(
  [(instance: Instance) => getFeatures(instance).version],
  (v) => ({
    /**
     * Apps are not supported by the API, and should not be created during login or registration.
     * @see POST /api/v1/apps
     * @see POST /oauth/token
     */
    noApps: v.software === MITRA,
  }),
);

export { getQuirks };

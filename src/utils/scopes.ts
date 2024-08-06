
import { PLEROMA, parseVersion } from './features';

import type { Instance } from 'pl-api';
import type { RootState } from 'soapbox/store';

/**
 * Get the OAuth scopes to use for login & signup.
 * Mastodon will refuse scopes it doesn't know, so care is needed.
 */
const getInstanceScopes = (instance: Instance) => {
  const v = parseVersion(instance.version);

  switch (v.software) {
    case PLEROMA:
      return 'read write follow push admin';
    default:
      return 'read write follow push';
  }
};

/** Convenience function to get scopes from instance in store. */
const getScopes = (state: RootState) => getInstanceScopes(state.instance);

export {
  getInstanceScopes,
  getScopes,
};

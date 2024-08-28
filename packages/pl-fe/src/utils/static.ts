/**
 * Static: functions related to static files.
 * @module soapbox/utils/static
 */

import { join } from 'path-browserify';

import * as BuildConfig from 'soapbox/build-config';

/** Gets the path to a file with build configuration being considered. */
const joinPublicPath = (...paths: string[]): string => join(BuildConfig.FE_SUBDIRECTORY, ...paths);

export { joinPublicPath };

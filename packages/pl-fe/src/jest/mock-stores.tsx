import { instanceSchema } from 'pl-api';
import * as v from 'valibot';

import alexJson from 'pl-fe/__fixtures__/pleroma-account.json';

import { buildAccount } from './factory';

/** Store with registrations open. */
const storeOpen = { instance: v.parse(instanceSchema, { registrations: true }) };

/** Store with registrations closed. */
const storeClosed = { instance: v.parse(instanceSchema, { registrations: false }) };

/** Store with a logged-in user. */
const storeLoggedIn = {
  me: alexJson.id,
  accounts: {
    [alexJson.id]: buildAccount(alexJson as any),
  },
};

export {
  storeOpen,
  storeClosed,
  storeLoggedIn,
};

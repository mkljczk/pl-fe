/**
 * Mention normalizer:
 * Converts API mentions into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/mention/}
 */
import { Record as ImmutableRecord } from 'immutable';

import { normalizeAccount } from 'soapbox/normalizers/account';

// https://docs.joinmastodon.org/entities/mention/
const MentionRecord = ImmutableRecord({
  id: '',
  acct: '',
  username: '',
  url: '',
});

const normalizeMention = (mention: Record<string, any>) =>
  // Simply normalize it as an account then cast it as a mention ¯\_(ツ)_/¯
  MentionRecord(normalizeAccount(mention));

export { MentionRecord, normalizeMention };

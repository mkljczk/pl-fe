/**
 * History normalizer:
 * Converts API daily usage history of a hashtag into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/history/}
 */
import {
  Map as ImmutableMap,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

// https://docs.joinmastodon.org/entities/history/
const HistoryRecord = ImmutableRecord({
  accounts: '',
  day: '',
  uses: '',
});

const normalizeHistory = (history: Record<string, any>) => HistoryRecord(ImmutableMap(fromJS(history)));

export { HistoryRecord, normalizeHistory };

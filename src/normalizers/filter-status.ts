/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/FilterStatus/}
 */
import { Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

// https://docs.joinmastodon.org/entities/FilterStatus/
const FilterStatusRecord = ImmutableRecord({
  id: '',
  status_id: '',
});

const normalizeFilterStatus = (filterStatus: Record<string, any>) => FilterStatusRecord(
  ImmutableMap(fromJS(filterStatus)),
);

export { FilterStatusRecord, normalizeFilterStatus };

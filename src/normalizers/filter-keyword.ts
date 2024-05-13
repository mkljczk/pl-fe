/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/FilterKeyword/}
 */
import { Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

// https://docs.joinmastodon.org/entities/FilterKeyword/
const FilterKeywordRecord = ImmutableRecord({
  id: '',
  keyword: '',
  whole_word: false,
});

const normalizeFilterKeyword = (filterKeyword: Record<string, any>) =>
  FilterKeywordRecord(
    ImmutableMap(fromJS(filterKeyword)),
  );

export { FilterKeywordRecord, normalizeFilterKeyword };

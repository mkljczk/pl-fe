/**
 * Tag normalizer:
 * Converts API tags into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/tag/}
 */
import {
  List as ImmutableList,
  Map as ImmutableMap,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import { normalizeHistory } from './history';

import type { History } from 'soapbox/types/entities';

// https://docs.joinmastodon.org/entities/tag/
const TagRecord = ImmutableRecord({
  name: '',
  url: '',
  history: null as ImmutableList<History> | null,
  following: false,
});

const normalizeHistoryList = (tag: ImmutableMap<string, any>) => {
  if (tag.get('history')){
    return tag.update('history', ImmutableList(), attachments => attachments.map(normalizeHistory));
  } else {
    return tag.set('history', null);
  }
};

const normalizeTag = (tag: Record<string, any>) => TagRecord(
  ImmutableMap(fromJS(tag)).withMutations(tag => {
    normalizeHistoryList(tag);
  }),
);

export { TagRecord, normalizeTag };

import { fromJS } from 'immutable';

import manifestMap from './manifest-map';

// All this does is converts the result from manifest_map.js into an ImmutableMap
const coinDB = fromJS(manifestMap);

/** Get title from CoinDB based on ticker symbol */
const getTitle = (ticker: string): string => {
  const title = coinDB.getIn([ticker, 'name']);
  return typeof title === 'string' ? title : '';
};

export { getTitle, coinDB as default };

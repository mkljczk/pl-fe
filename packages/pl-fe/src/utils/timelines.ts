import { type Collection, Map as ImmutableMap } from 'immutable';

import type { Status } from 'pl-fe/normalizers';

const shouldFilter = (
  status: Pick<Status, 'in_reply_to_id' | 'visibility' | 'reblog_id'>,
  columnSettings: Collection<any, any>,
) => {
  const shows = ImmutableMap({
    reblog: status.reblog_id !== null,
    reply: status.in_reply_to_id !== null,
    direct: status.visibility === 'direct',
  });

  return shows.some(
    (value, key) => columnSettings.getIn(['shows', key]) === false && value,
  );
};

export { shouldFilter };

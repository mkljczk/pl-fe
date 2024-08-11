import { statusSchema } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { normalizeStatus } from 'soapbox/normalizers/status';

import type { ScheduledStatus } from 'soapbox/reducers/scheduled-statuses';
import type { RootState } from 'soapbox/store';

const buildStatus = (state: RootState, scheduledStatus: ScheduledStatus) => {
  const me = state.me as string;
  const account = state.entities[Entities.ACCOUNTS]?.store[me];

  const status = statusSchema.parse({
    account,
    content: scheduledStatus.text.replace(new RegExp('\n', 'g'), '<br>'), /* eslint-disable-line no-control-regex */
    created_at: scheduledStatus.scheduled_at,
    id: scheduledStatus.id,
    in_reply_to_id: scheduledStatus.in_reply_to_id,
    media_attachments: scheduledStatus.media_attachments,
    poll: scheduledStatus.poll,
    sensitive: scheduledStatus.sensitive,
    uri: `/scheduled_statuses/${scheduledStatus.id}`,
    url: `/scheduled_statuses/${scheduledStatus.id}`,
    visibility: scheduledStatus.visibility,
  });

  return normalizeStatus(status);
};

export { buildStatus };

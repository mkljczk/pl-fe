import { statusSchema } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { normalizeStatus } from 'soapbox/normalizers/status';

import type { DraftStatus } from 'soapbox/reducers/draft-statuses';
import type { RootState } from 'soapbox/store';

const buildPoll = (draftStatus: DraftStatus) => {
  if (draftStatus.hasIn(['poll', 'options'])) {
    return {
      ...draftStatus.poll!.toJS(),
      id: `${draftStatus.draft_id}-poll`,
      options: draftStatus.poll!.get('options').map((title: string) => ({ title })).toArray(),
    };
  } else {
    return null;
  }
};

const buildStatus = (state: RootState, draftStatus: DraftStatus) => {
  const me = state.me as string;
  const account = state.entities[Entities.ACCOUNTS]?.store[me];

  const status = statusSchema.parse({
    account,
    content: draftStatus.text.replace(new RegExp('\n', 'g'), '<br>'), /* eslint-disable-line no-control-regex */
    created_at: draftStatus.schedule,
    group: draftStatus.group_id,
    in_reply_to_id: draftStatus.in_reply_to,
    media_attachments: draftStatus.media_attachments,
    poll: buildPoll(draftStatus),
    quote: draftStatus.quote,
    sensitive: draftStatus.sensitive,
    spoiler_text: draftStatus.spoiler_text,
    uri: `/draft_statuses/${draftStatus.draft_id}`,
    url: `/draft_statuses/${draftStatus.draft_id}`,
    visibility: draftStatus.privacy,
  });

  return normalizeStatus(status);
};

export { buildStatus };

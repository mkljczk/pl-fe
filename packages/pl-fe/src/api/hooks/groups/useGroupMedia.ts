import { statusSchema } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { normalizeStatus } from 'soapbox/normalizers';

const useGroupMedia = (groupId: string) => {
  const client = useClient();

  return useEntities(
    [Entities.STATUSES, 'groupMedia', groupId],
    () => client.timelines.groupTimeline(groupId, { only_media: true }),
    { schema: statusSchema, transform: normalizeStatus })
  ;
};

export { useGroupMedia };

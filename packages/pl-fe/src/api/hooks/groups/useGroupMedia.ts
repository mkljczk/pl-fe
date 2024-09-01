import { Entities } from 'pl-fe/entity-store/entities';
import { useEntities } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks';
import { normalizeStatus } from 'pl-fe/normalizers';

const useGroupMedia = (groupId: string) => {
  const client = useClient();

  return useEntities(
    [Entities.STATUSES, 'groupMedia', groupId],
    () => client.timelines.groupTimeline(groupId, { only_media: true }),
    { transform: normalizeStatus })
  ;
};

export { useGroupMedia };

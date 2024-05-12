import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { normalizeStatus } from 'soapbox/normalizers';
import { toSchema } from 'soapbox/utils/normalizers';

const statusSchema = toSchema(normalizeStatus);

const useGroupMedia = (groupId: string) => {
  const api = useApi();

  return useEntities(
    [Entities.STATUSES, 'groupMedia', groupId],
    () => api(`/api/v1/timelines/group/${groupId}?only_media=true`),
    { schema: statusSchema })
  ;
};

export { useGroupMedia };
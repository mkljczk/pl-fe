import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { useFeatures } from 'soapbox/hooks/useFeatures';
import { groupSchema, type Group } from 'soapbox/schemas/group';

import { useGroupRelationships } from './useGroupRelationships';

function useGroups() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'search', ''],
    () => api.get('/api/v1/groups'),
    { enabled: features.groups, schema: groupSchema },
  );
  const { relationships } = useGroupRelationships(
    ['search', ''],
    entities.map(entity => entity.id),
  );

  const groups = entities.map((group) => ({
    ...group,
    relationship: relationships[group.id] || null,
  }));

  return {
    ...result,
    groups,
  };
}

export { useGroups };

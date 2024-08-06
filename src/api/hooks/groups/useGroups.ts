import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { useFeatures } from 'soapbox/hooks/useFeatures';
import { groupSchema, type Group } from 'soapbox/schemas/group';

import { useGroupRelationships } from './useGroupRelationships';

const useGroups = () => {
  const client = useClient();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'search', ''],
    () => client.experimental.groups.getGroups(),
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
};

export { useGroups };

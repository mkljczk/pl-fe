import { groupSchema, type Group as BaseGroup } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { useFeatures } from 'soapbox/hooks/useFeatures';
import { normalizeGroup, type Group } from 'soapbox/normalizers';

import { useGroupRelationships } from './useGroupRelationships';

const useGroups = () => {
  const client = useClient();
  const features = useFeatures();

  const { entities, ...result } = useEntities<BaseGroup, Group>(
    [Entities.GROUPS, 'search', ''],
    () => client.experimental.groups.getGroups(),
    { enabled: features.groups, schema: groupSchema, transform: normalizeGroup },
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

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntities } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks';
import { useFeatures } from 'pl-fe/hooks/useFeatures';
import { type Group, normalizeGroup } from 'pl-fe/normalizers';

import { useGroupRelationships } from './useGroupRelationships';

import type { Group as BaseGroup } from 'pl-api';

const useGroups = () => {
  const client = useClient();
  const features = useFeatures();

  const { entities, ...result } = useEntities<BaseGroup, Group>(
    [Entities.GROUPS, 'search', ''],
    () => client.experimental.groups.getGroups(),
    { enabled: features.groups, transform: normalizeGroup },
  );
  const { relationships } = useGroupRelationships(
    ['search', ''],
    entities.map((entity) => entity.id),
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

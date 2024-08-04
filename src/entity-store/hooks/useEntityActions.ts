import { useClient } from 'soapbox/hooks';

import { useCreateEntity } from './useCreateEntity';
import { useDeleteEntity } from './useDeleteEntity';
import { parseEntitiesPath } from './utils';

import type { EntitySchema, ExpandedEntitiesPath } from './types';
import type { Entity } from '../types';

interface UseEntityActionsOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>;
}

interface EntityActionEndpoints {
  delete?: string;
  patch?: string;
  post?: string;
}

const useEntityActions = <TEntity extends Entity = Entity, Data = any>(
  expandedPath: ExpandedEntitiesPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) => {
  const client = useClient();
  const { entityType, path } = parseEntitiesPath(expandedPath);

  const { deleteEntity, isSubmitting: deleteSubmitting } =
    useDeleteEntity(entityType, (entityId) => client.request(endpoints.delete!.replace(/:id/g, entityId), { method: 'DELETE' }));

  const { createEntity, isSubmitting: createSubmitting } =
    useCreateEntity<TEntity, Data>(path, (data) => client.request(endpoints.post!, {
      method: 'POST', body: data,
    }), opts);

  const { createEntity: updateEntity, isSubmitting: updateSubmitting } =
    useCreateEntity<TEntity, Data>(path, (data) => client.request(endpoints.patch!, {
      method: 'PATCH', body: data,
    }), opts);

  return {
    createEntity,
    deleteEntity,
    updateEntity,
    isSubmitting: createSubmitting || deleteSubmitting || updateSubmitting,
  };
};

export { useEntityActions };
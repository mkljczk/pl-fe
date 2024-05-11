import { useApi } from 'soapbox/hooks/useApi';

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

function useEntityActions<TEntity extends Entity = Entity, Data = any>(
  expandedPath: ExpandedEntitiesPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) {
  const api = useApi();
  const { entityType, path } = parseEntitiesPath(expandedPath);

  const { deleteEntity, isSubmitting: deleteSubmitting } =
    useDeleteEntity(entityType, (entityId) => api(endpoints.delete!.replace(/:id/g, entityId), { method: 'DELETE' }));

  const { createEntity, isSubmitting: createSubmitting } =
    useCreateEntity<TEntity, Data>(path, (data) => api(endpoints.post!, {
      method: 'POST',
      body: JSON.stringify(data),
    }), opts);

  const { createEntity: updateEntity, isSubmitting: updateSubmitting } =
    useCreateEntity<TEntity, Data>(path, (data) => api(endpoints.patch!, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }), opts);

  return {
    createEntity,
    deleteEntity,
    updateEntity,
    isSubmitting: createSubmitting || deleteSubmitting || updateSubmitting,
  };
}

export { useEntityActions };
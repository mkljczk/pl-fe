import { z } from 'zod';

import { useAppDispatch } from 'soapbox/hooks/useAppDispatch';
import { useLoading } from 'soapbox/hooks/useLoading';

import { importEntities } from '../actions';

import { parseEntitiesPath } from './utils';

import type { EntityCallbacks, EntityFn, EntitySchema, ExpandedEntitiesPath } from './types';
import type { Entity } from '../types';

interface UseCreateEntityOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>;
}

function useCreateEntity<TEntity extends Entity = Entity, Data = unknown>(
  expandedPath: ExpandedEntitiesPath,
  entityFn: EntityFn<Data>,
  opts: UseCreateEntityOpts<TEntity> = {},
) {
  const dispatch = useAppDispatch();

  const [isSubmitting, setPromise] = useLoading();
  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  async function createEntity(data: Data, callbacks: EntityCallbacks<TEntity, { response?: Response & { json: any } }> = {}): Promise<void> {
    const result = await setPromise(entityFn(data));
    const schema = opts.schema || z.custom<TEntity>();
    const entity = schema.parse(result.json);

    // TODO: optimistic updating
    dispatch(importEntities([entity], entityType, listKey, 'start'));

    if (callbacks.onSuccess) {
      callbacks.onSuccess(entity);
    }
  }

  return {
    createEntity,
    isSubmitting,
  };
}

export { useCreateEntity };
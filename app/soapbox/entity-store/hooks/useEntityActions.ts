import { useState } from 'react';
import { z } from 'zod';

import { useApi, useAppDispatch, useGetState } from 'soapbox/hooks';

import { deleteEntities, importEntities } from '../actions';

import type { Entity } from '../types';
import type { EntitySchema } from './types';
import type { AxiosResponse } from 'axios';

type EntityPath = [entityType: string, listKey?: string]

interface UseEntityActionsOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>
}

interface CreateEntityResult<TEntity extends Entity = Entity> {
  response: AxiosResponse
  entity: TEntity
}

interface DeleteEntityResult {
  response: AxiosResponse
}

interface EntityActionEndpoints {
  post?: string
  delete?: string
}

interface EntityCallbacks<TEntity extends Entity = Entity> {
  onSuccess?(entity?: TEntity): void
}

function useEntityActions<TEntity extends Entity = Entity, P = any>(
  path: EntityPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) {
  const api = useApi();
  const dispatch = useAppDispatch();
  const getState = useGetState();
  const [entityType, listKey] = path;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  function createEntity(params: P, callbacks: EntityCallbacks = {}): Promise<CreateEntityResult<TEntity>> {
    if (!endpoints.post) return Promise.reject(endpoints);

    setIsLoading(true);

    return api.post(endpoints.post, params).then((response) => {
      const schema = opts.schema || z.custom<TEntity>();
      const entity = schema.parse(response.data);

      // TODO: optimistic updating
      dispatch(importEntities([entity], entityType, listKey));

      if (callbacks.onSuccess) {
        callbacks.onSuccess(entity);
      }

      setIsLoading(false);

      return {
        response,
        entity,
      };
    });
  }

  function deleteEntity(entityId: string, callbacks: EntityCallbacks = {}): Promise<DeleteEntityResult> {
    if (!endpoints.delete) return Promise.reject(endpoints);
    // Get the entity before deleting, so we can reverse the action if the API request fails.
    const entity = getState().entities[entityType]?.store[entityId];
    // Optimistically delete the entity from the _store_ but keep the lists in tact.
    dispatch(deleteEntities([entityId], entityType, { preserveLists: true }));

    setIsLoading(true);

    return api.delete(endpoints.delete.replaceAll(':id', entityId)).then((response) => {
      if (callbacks.onSuccess) {
        callbacks.onSuccess();
      }

      // Success - finish deleting entity from the state.
      dispatch(deleteEntities([entityId], entityType));

      return {
        response,
      };
    }).catch((e) => {
      if (entity) {
        // If the API failed, reimport the entity.
        dispatch(importEntities([entity], entityType));
      }
      throw e;
    }).finally(() => {
      setIsLoading(false);
    });
  }

  return {
    createEntity,
    deleteEntity,
    isLoading,
  };
}

export { useEntityActions };
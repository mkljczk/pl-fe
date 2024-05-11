import { useEffect, useState } from 'react';
import z from 'zod';

import { useAppDispatch } from 'soapbox/hooks/useAppDispatch';
import { useAppSelector } from 'soapbox/hooks/useAppSelector';
import { useLoading } from 'soapbox/hooks/useLoading';

import { importEntities } from '../actions';
import { selectEntity } from '../selectors';

import type { EntitySchema, EntityPath, EntityFn } from './types';
import type { Entity } from '../types';

/** Additional options for the hook. */
interface UseEntityOpts<TEntity extends Entity> {
  /** A zod schema to parse the API entity. */
  schema?: EntitySchema<TEntity>;
  /** Whether to refetch this entity every time the hook mounts, even if it's already in the store. */
  refetch?: boolean;
  /** A flag to potentially disable sending requests to the API. */
  enabled?: boolean;
}

function useEntity<TEntity extends Entity>(
  path: EntityPath,
  entityFn: EntityFn<void>,
  opts: UseEntityOpts<TEntity> = {},
) {
  const [isFetching, setPromise] = useLoading(true);
  const [error, setError] = useState<unknown>();

  const dispatch = useAppDispatch();

  const [entityType, entityId] = path;

  const defaultSchema = z.custom<TEntity>();
  const schema = opts.schema || defaultSchema;

  const entity = useAppSelector(state => selectEntity<TEntity>(state, entityType, entityId));

  const isEnabled = opts.enabled ?? true;
  const isLoading = isFetching && !entity;
  const isLoaded = !isFetching && !!entity;

  const fetchEntity = async () => {
    try {
      const response = await setPromise(entityFn());
      const entity = schema.parse(response.json);
      dispatch(importEntities([entity], entityType));
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (!isEnabled || error) return;
    if (!entity || opts.refetch) {
      fetchEntity();
    }
  }, [isEnabled]);

  return {
    entity,
    fetchEntity,
    isFetching,
    isLoading,
    isLoaded,
    error,
    isUnauthorized: (error as { response?: Response })?.response?.status === 401,
    isForbidden: (error as { response?: Response })?.response?.status === 403,
  };
}

export {
  useEntity,
  type UseEntityOpts,
};
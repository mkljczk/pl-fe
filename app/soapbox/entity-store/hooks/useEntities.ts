import { useEffect } from 'react';
import z from 'zod';

import { getNextLink, getPrevLink } from 'soapbox/api';
import { useApi, useAppDispatch, useAppSelector } from 'soapbox/hooks';

import { entitiesFetchFail, entitiesFetchRequest, entitiesFetchSuccess } from '../actions';

import type { Entity } from '../types';
import type { RootState } from 'soapbox/store';

/** Tells us where to find/store the entity in the cache. */
type EntityPath = [
  /** Name of the entity type for use in the global cache, eg `'Notification'`. */
  entityType: string,
  /** Name of a particular index of this entity type. You can use empty-string (`''`) if you don't need separate lists. */
  listKey: string,
]

/** Additional options for the hook. */
interface UseEntitiesOpts<TEntity extends Entity> {
  /** A zod schema to parse the API entities. */
  schema?: z.ZodType<TEntity, z.ZodTypeDef, any>
  /**
   * Time (milliseconds) until this query becomes stale and should be refetched.
   * It is 1 minute by default, and can be set to `Infinity` to opt-out of automatic fetching.
   */
  staleTime?: number
}

/** A hook for fetching and displaying API entities. */
function useEntities<TEntity extends Entity>(
  /** Tells us where to find/store the entity in the cache. */
  path: EntityPath,
  /** API route to GET, eg `'/api/v1/notifications'`. If undefined, nothing will be fetched. */
  endpoint: string | undefined,
  /** Additional options for the hook. */
  opts: UseEntitiesOpts<TEntity> = {},
) {
  const api = useApi();
  const dispatch = useAppDispatch();

  const [entityType, listKey] = path;

  const defaultSchema = z.custom<TEntity>();
  const schema = opts.schema || defaultSchema;

  const cache = useAppSelector(state => state.entities[entityType]);
  const list = cache?.lists[listKey];

  const entityIds = list?.ids;

  const entities: readonly TEntity[] = entityIds ? (
    Array.from(entityIds).reduce<TEntity[]>((result, id) => {
      // TODO: parse after fetch, not during render.
      const entity = schema.safeParse(cache?.store[id]);
      if (entity.success) {
        result.push(entity.data);
      }
      return result;
    }, [])
  ) : [];

  const isFetching = Boolean(list?.state.fetching);
  const isLoading = isFetching && entities.length === 0;
  const hasNextPage = Boolean(list?.state.next);
  const hasPreviousPage = Boolean(list?.state.prev);

  const fetchPage = async(url: string): Promise<void> => {
    // Get `isFetching` state from the store again to prevent race conditions.
    const isFetching = dispatch((_, getState: () => RootState) => Boolean(getState().entities[entityType]?.lists[listKey]?.state.fetching));
    if (isFetching) return;

    dispatch(entitiesFetchRequest(entityType, listKey));
    try {
      const response = await api.get(url);
      dispatch(entitiesFetchSuccess(response.data, entityType, listKey, {
        next: getNextLink(response),
        prev: getPrevLink(response),
        fetching: false,
        error: null,
        lastFetchedAt: new Date(),
      }));
    } catch (error) {
      dispatch(entitiesFetchFail(entityType, listKey, error));
    }
  };

  const fetchEntities = async(): Promise<void> => {
    if (endpoint) {
      await fetchPage(endpoint);
    }
  };

  const fetchNextPage = async(): Promise<void> => {
    const next = list?.state.next;

    if (next) {
      await fetchPage(next);
    }
  };

  const fetchPreviousPage = async(): Promise<void> => {
    const prev = list?.state.prev;

    if (prev) {
      await fetchPage(prev);
    }
  };

  const staleTime = opts.staleTime ?? 60000;
  const lastFetchedAt = list?.state.lastFetchedAt;

  useEffect(() => {
    if (!isFetching && (!lastFetchedAt || lastFetchedAt.getTime() + staleTime <= Date.now())) {
      fetchEntities();
    }
  }, [endpoint]);

  return {
    entities,
    fetchEntities,
    isFetching,
    isLoading,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
  };
}

export {
  useEntities,
};
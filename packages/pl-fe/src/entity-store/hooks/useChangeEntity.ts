import { importEntities } from 'pl-fe/entity-store/actions';
import { Entities } from 'pl-fe/entity-store/entities';
import { useAppDispatch } from 'pl-fe/hooks/useAppDispatch';
import { useGetState } from 'pl-fe/hooks/useGetState';

import type { Entity } from 'pl-fe/entity-store/types';

type ChangeEntityFn<TEntity extends Entity> = (entity: TEntity) => TEntity;

const useChangeEntity = <TEntity extends Entity = Entity>(
  entityType: Entities,
) => {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const changeEntity = (
    entityId: string,
    change: ChangeEntityFn<TEntity>,
  ): void => {
    if (!entityId) return;
    const entity = getState().entities[entityType]?.store[entityId] as
      | TEntity
      | undefined;
    if (entity) {
      const newEntity = change(entity);
      dispatch(importEntities([newEntity], entityType));
    }
  };

  return { changeEntity };
};

export { useChangeEntity, type ChangeEntityFn };

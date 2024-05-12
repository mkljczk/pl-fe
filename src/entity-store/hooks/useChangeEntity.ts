import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { type Entity } from 'soapbox/entity-store/types';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch';
import { useGetState } from 'soapbox/hooks/useGetState';

type ChangeEntityFn<TEntity extends Entity> = (entity: TEntity) => TEntity

const useChangeEntity = <TEntity extends Entity = Entity>(entityType: Entities) => {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const changeEntity = (entityId: string, change: ChangeEntityFn<TEntity>): void => {
    if (!entityId) return;
    const entity = getState().entities[entityType]?.store[entityId] as TEntity | undefined;
    if (entity) {
      const newEntity = change(entity);
      dispatch(importEntities([newEntity], entityType));
    }
  };

  return { changeEntity };
};

export { useChangeEntity, type ChangeEntityFn };
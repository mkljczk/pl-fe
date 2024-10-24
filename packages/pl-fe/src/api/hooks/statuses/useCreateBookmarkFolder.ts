import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks/useCreateEntity';
import { useClient } from 'pl-fe/hooks/useClient';

interface CreateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useCreateBookmarkFolder = () => {
  const client = useClient();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.BOOKMARK_FOLDERS],
    (params: CreateBookmarkFolderParams) =>
      client.myAccount.createBookmarkFolder(params),
  );

  return {
    createBookmarkFolder: createEntity,
    ...rest,
  };
};

export { useCreateBookmarkFolder };

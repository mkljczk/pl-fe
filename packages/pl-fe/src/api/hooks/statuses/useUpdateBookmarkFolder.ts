import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks/useCreateEntity';
import { useClient } from 'pl-fe/hooks/useClient';

interface UpdateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useUpdateBookmarkFolder = (folderId: string) => {
  const client = useClient();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.BOOKMARK_FOLDERS],
    (params: UpdateBookmarkFolderParams) =>
      client.myAccount.updateBookmarkFolder(folderId, params),
  );

  return {
    updateBookmarkFolder: createEntity,
    ...rest,
  };
};

export { useUpdateBookmarkFolder };

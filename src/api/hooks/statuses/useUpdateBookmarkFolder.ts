import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { bookmarkFolderSchema } from 'soapbox/schemas/bookmark-folder';

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
    { schema: bookmarkFolderSchema },
  );

  return {
    updateBookmarkFolder: createEntity,
    ...rest,
  };
};

export { useUpdateBookmarkFolder };

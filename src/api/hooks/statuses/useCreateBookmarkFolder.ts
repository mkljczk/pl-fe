import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { bookmarkFolderSchema } from 'soapbox/schemas/bookmark-folder';

interface CreateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useCreateBookmarkFolder = () => {
  const client = useClient();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.BOOKMARK_FOLDERS],
    (params: CreateBookmarkFolderParams) =>
      client.request('/api/v1/pleroma/bookmark_folders', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    { schema: bookmarkFolderSchema },
  );

  return {
    createBookmarkFolder: createEntity,
    ...rest,
  };
};

export { useCreateBookmarkFolder };

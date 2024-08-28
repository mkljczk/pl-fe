import { bookmarkFolderSchema } from 'pl-api';

import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks';

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
    { schema: bookmarkFolderSchema },
  );

  return {
    createBookmarkFolder: createEntity,
    ...rest,
  };
};

export { useCreateBookmarkFolder };

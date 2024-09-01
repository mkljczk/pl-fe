import { Entities } from 'pl-fe/entity-store/entities';
import { useEntities } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks';
import { useFeatures } from 'pl-fe/hooks/useFeatures';

import type { BookmarkFolder } from 'pl-api';

const useBookmarkFolders = () => {
  const client = useClient();
  const features = useFeatures();

  const { entities, ...result } = useEntities<BookmarkFolder>(
    [Entities.BOOKMARK_FOLDERS],
    () => client.myAccount.getBookmarkFolders(),
    { enabled: features.bookmarkFolders },
  );

  const bookmarkFolders = entities;

  return {
    ...result,
    bookmarkFolders,
  };
};

export { useBookmarkFolders };

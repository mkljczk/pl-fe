import { useClient } from 'soapbox/hooks';
import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useFeatures } from 'soapbox/hooks/useFeatures';
import { bookmarkFolderSchema, type BookmarkFolder } from 'soapbox/schemas/bookmark-folder';

const useBookmarkFolders = () => {
  const client = useClient();
  const features = useFeatures();

  const { entities, ...result } = useEntities<BookmarkFolder>(
    [Entities.BOOKMARK_FOLDERS],
    () => client.myAccount.getBookmarkFolders,
    { enabled: features.bookmarkFolders, schema: bookmarkFolderSchema },
  );

  const bookmarkFolders = entities;

  return {
    ...result,
    bookmarkFolders,
  };
};

export { useBookmarkFolders };

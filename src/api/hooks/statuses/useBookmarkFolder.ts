import { type BookmarkFolder } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { selectEntity } from 'soapbox/entity-store/selectors';
import { useAppSelector } from 'soapbox/hooks';

import { useBookmarkFolders } from './useBookmarkFolders';

const useBookmarkFolder = (folderId?: string) => {
  const {
    isError,
    isFetched,
    isFetching,
    isLoading,
    invalidate,
  } = useBookmarkFolders();

  const bookmarkFolder = useAppSelector(state => folderId
    ? selectEntity<BookmarkFolder>(state, Entities.BOOKMARK_FOLDERS, folderId)
    : undefined);

  return {
    bookmarkFolder,
    isError,
    isFetched,
    isFetching,
    isLoading,
    invalidate,
  };
};

export { useBookmarkFolder };

import type { PaginationParams } from './common';

interface GetBookmarksParams extends PaginationParams {
  /**
   * Bookmark folder ID
   * Requires `features.bookmarkFolders`.
   */
  folder_id?: string;
}

type GetFavouritesParams = PaginationParams;
type GetFollowRequestsParams = Omit<PaginationParams, 'min_id'>;
type GetEndorsementsParams = Omit<PaginationParams, 'min_id'>;
type GetFollowedTagsParams = PaginationParams;

interface CreateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

type UpdateBookmarkFolderParams = Partial<CreateBookmarkFolderParams>;

export type {
  GetBookmarksParams,
  GetFavouritesParams,
  GetFollowRequestsParams,
  GetEndorsementsParams,
  GetFollowedTagsParams,
  CreateBookmarkFolderParams,
  UpdateBookmarkFolderParams,
};

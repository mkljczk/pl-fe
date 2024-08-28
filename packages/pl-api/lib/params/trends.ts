interface GetTrends {
  /** Integer. Maximum number of results to return. */
  limit?: number;
  /** Integer. Skip the first n results. */
  offset?: number;
}

type GetTrendingTags = GetTrends;
type GetTrendingStatuses = GetTrends;
type GetTrendingLinks = GetTrends;

export type {
  GetTrendingTags,
  GetTrendingStatuses,
  GetTrendingLinks,
};

import type { Tag } from 'pl-api';

const TRENDS_FETCH_SUCCESS = 'TRENDS_FETCH_SUCCESS';

const fetchTrendsSuccess = (tags: Array<Tag>) => ({
  type: TRENDS_FETCH_SUCCESS,
  tags,
});

export { TRENDS_FETCH_SUCCESS, fetchTrendsSuccess };

import type { APIEntity } from 'soapbox/types/entities';

const TRENDS_FETCH_SUCCESS = 'TRENDS_FETCH_SUCCESS';

const fetchTrendsSuccess = (tags: APIEntity[]) => ({
  type: TRENDS_FETCH_SUCCESS,
  tags,
  skipLoading: true,
});

export {
  TRENDS_FETCH_SUCCESS,
  fetchTrendsSuccess,
};

import { getClient } from 'pl-fe/api';

import type { SaveMarkersParams } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const MARKER_FETCH_REQUEST = 'MARKER_FETCH_REQUEST' as const;
const MARKER_FETCH_SUCCESS = 'MARKER_FETCH_SUCCESS' as const;
const MARKER_FETCH_FAIL = 'MARKER_FETCH_FAIL' as const;

const MARKER_SAVE_REQUEST = 'MARKER_SAVE_REQUEST' as const;
const MARKER_SAVE_SUCCESS = 'MARKER_SAVE_SUCCESS' as const;
const MARKER_SAVE_FAIL = 'MARKER_SAVE_FAIL' as const;

const fetchMarker = (timeline: Array<string>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: MARKER_FETCH_REQUEST });
    return getClient(getState).timelines.getMarkers(timeline).then((marker) => {
      dispatch({ type: MARKER_FETCH_SUCCESS, marker });
    }).catch(error => {
      dispatch({ type: MARKER_FETCH_FAIL, error });
    });
  };

const saveMarker = (marker: SaveMarkersParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: MARKER_SAVE_REQUEST, marker });
    return getClient(getState).timelines.saveMarkers(marker).then((marker) => {
      dispatch({ type: MARKER_SAVE_SUCCESS, marker });
    }).catch(error => {
      dispatch({ type: MARKER_SAVE_FAIL, error });
    });
  };

export {
  MARKER_FETCH_REQUEST,
  MARKER_FETCH_SUCCESS,
  MARKER_FETCH_FAIL,
  MARKER_SAVE_REQUEST,
  MARKER_SAVE_SUCCESS,
  MARKER_SAVE_FAIL,
  fetchMarker,
  saveMarker,
};

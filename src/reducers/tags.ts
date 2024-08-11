import { Map as ImmutableMap } from 'immutable';

import {
  HASHTAG_FETCH_SUCCESS,
  HASHTAG_FOLLOW_REQUEST,
  HASHTAG_FOLLOW_FAIL,
  HASHTAG_UNFOLLOW_REQUEST,
  HASHTAG_UNFOLLOW_FAIL,
} from 'soapbox/actions/tags';

import type { Tag } from 'pl-api';
import type { AnyAction } from 'redux';

const initialState = ImmutableMap<string, Tag>();

const tags = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case HASHTAG_FETCH_SUCCESS:
      return state.set(action.name, action.tag);
    case HASHTAG_FOLLOW_REQUEST:
    case HASHTAG_UNFOLLOW_FAIL:
      return state.setIn([action.name, 'following'], true);
    case HASHTAG_FOLLOW_FAIL:
    case HASHTAG_UNFOLLOW_REQUEST:
      return state.setIn([action.name, 'following'], false);
    default:
      return state;
  }
};

export { tags as default };

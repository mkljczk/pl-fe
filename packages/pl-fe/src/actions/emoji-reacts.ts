import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import { importFetchedStatus } from './importer';
import { favourite, unfavourite } from './interactions';

import type { EmojiReaction, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const EMOJI_REACT_REQUEST = 'EMOJI_REACT_REQUEST' as const;
const EMOJI_REACT_SUCCESS = 'EMOJI_REACT_SUCCESS' as const;
const EMOJI_REACT_FAIL = 'EMOJI_REACT_FAIL' as const;

const UNEMOJI_REACT_REQUEST = 'UNEMOJI_REACT_REQUEST' as const;
const UNEMOJI_REACT_SUCCESS = 'UNEMOJI_REACT_SUCCESS' as const;
const UNEMOJI_REACT_FAIL = 'UNEMOJI_REACT_FAIL' as const;

const noOp = () => () => new Promise(f => f(undefined));

const simpleEmojiReact = (status: Pick<Status, 'id' | 'emoji_reactions' | 'favourited'>, emoji: string, custom?: string) =>
  (dispatch: AppDispatch) => {
    const emojiReacts: Array<EmojiReaction> = status.emoji_reactions || [];

    if (emoji === '👍' && status.favourited) return dispatch(unfavourite(status));

    const undo = emojiReacts.filter(e => e.me === true && e.name === emoji).length > 0;
    if (undo) return dispatch(unEmojiReact(status, emoji));

    return Promise.all([
      ...emojiReacts
        .filter((emojiReact) => emojiReact.me === true)
        .map(emojiReact => dispatch(unEmojiReact(status, emojiReact.name))),
      status.favourited && dispatch(unfavourite(status)),
    ]).then(() => {
      if (emoji === '👍') {
        dispatch(favourite(status));
      } else {
        dispatch(emojiReact(status, emoji, custom));
      }
    }).catch(err => {
      console.error(err);
    });
  };

const emojiReact = (status: Pick<Status, 'id'>, emoji: string, custom?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp());

    dispatch(emojiReactRequest(status.id, emoji, custom));

    return getClient(getState).statuses.createStatusReaction(status.id, emoji).then((response) => {
      dispatch(importFetchedStatus(response));
      dispatch(emojiReactSuccess(response, emoji));
    }).catch((error) => {
      dispatch(emojiReactFail(status.id, emoji, error));
    });
  };

const unEmojiReact = (status: Pick<Status, 'id'>, emoji: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp());

    dispatch(unEmojiReactRequest(status.id, emoji));

    return getClient(getState).statuses.deleteStatusReaction(status.id, emoji).then(response => {
      dispatch(importFetchedStatus(response));
      dispatch(unEmojiReactSuccess(response, emoji));
    }).catch(error => {
      dispatch(unEmojiReactFail(status.id, emoji, error));
    });
  };

const emojiReactRequest = (statusId: string, emoji: string, custom?: string) => ({
  type: EMOJI_REACT_REQUEST,
  statusId,
  emoji,
  custom,
});

const emojiReactSuccess = (status: Status, emoji: string) => ({
  type: EMOJI_REACT_SUCCESS,
  status,
  statusId: status.id,
  emoji,
});

const emojiReactFail = (statusId: string, emoji: string, error: unknown) => ({
  type: EMOJI_REACT_FAIL,
  statusId,
  emoji,
  error,
});

const unEmojiReactRequest = (statusId: string, emoji: string) => ({
  type: UNEMOJI_REACT_REQUEST,
  statusId,
  emoji,
});

const unEmojiReactSuccess = (status: Status, emoji: string) => ({
  type: UNEMOJI_REACT_SUCCESS,
  status,
  statusId: status.id,
  emoji,
});

const unEmojiReactFail = (statusId: string, emoji: string, error: unknown) => ({
  type: UNEMOJI_REACT_FAIL,
  statusId,
  emoji,
  error,
});

export {
  EMOJI_REACT_REQUEST,
  EMOJI_REACT_SUCCESS,
  EMOJI_REACT_FAIL,
  UNEMOJI_REACT_REQUEST,
  UNEMOJI_REACT_SUCCESS,
  UNEMOJI_REACT_FAIL,
  simpleEmojiReact,
  emojiReact,
  unEmojiReact,
  emojiReactRequest,
  emojiReactSuccess,
  emojiReactFail,
  unEmojiReactRequest,
  unEmojiReactSuccess,
  unEmojiReactFail,
};

import { List as ImmutableList } from 'immutable';
import throttle from 'lodash/throttle';
import { defineMessages, IntlShape } from 'react-intl';

import api from 'soapbox/api';
import { isNativeEmoji } from 'soapbox/features/emoji';
import emojiSearch from 'soapbox/features/emoji/search';
import { normalizeTag } from 'soapbox/normalizers';
import { selectAccount, selectOwnAccount, makeGetAccount } from 'soapbox/selectors';
import { tagHistory } from 'soapbox/settings';
import toast from 'soapbox/toast';
import { isLoggedIn } from 'soapbox/utils/auth';
import { getFeatures, parseVersion } from 'soapbox/utils/features';

import { chooseEmoji } from './emojis';
import { importFetchedAccounts } from './importer';
import { uploadFile, updateMedia } from './media';
import { openModal, closeModal } from './modals';
import { getSettings } from './settings';
import { createStatus } from './statuses';

import type { EditorState } from 'lexical';
import type { AutoSuggestion } from 'soapbox/components/autosuggest-input';
import type { Emoji } from 'soapbox/features/emoji';
import type { Account, Group } from 'soapbox/schemas';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Status, Tag } from 'soapbox/types/entities';
import type { History } from 'soapbox/types/history';

let cancelFetchComposeSuggestions = new AbortController();

const COMPOSE_CHANGE          = 'COMPOSE_CHANGE' as const;
const COMPOSE_SUBMIT_REQUEST  = 'COMPOSE_SUBMIT_REQUEST' as const;
const COMPOSE_SUBMIT_SUCCESS  = 'COMPOSE_SUBMIT_SUCCESS' as const;
const COMPOSE_SUBMIT_FAIL     = 'COMPOSE_SUBMIT_FAIL' as const;
const COMPOSE_REPLY           = 'COMPOSE_REPLY' as const;
const COMPOSE_EVENT_REPLY     = 'COMPOSE_EVENT_REPLY' as const;
const COMPOSE_REPLY_CANCEL    = 'COMPOSE_REPLY_CANCEL' as const;
const COMPOSE_QUOTE           = 'COMPOSE_QUOTE' as const;
const COMPOSE_QUOTE_CANCEL    = 'COMPOSE_QUOTE_CANCEL' as const;
const COMPOSE_DIRECT          = 'COMPOSE_DIRECT' as const;
const COMPOSE_MENTION         = 'COMPOSE_MENTION' as const;
const COMPOSE_RESET           = 'COMPOSE_RESET' as const;
const COMPOSE_UPLOAD_REQUEST  = 'COMPOSE_UPLOAD_REQUEST' as const;
const COMPOSE_UPLOAD_SUCCESS  = 'COMPOSE_UPLOAD_SUCCESS' as const;
const COMPOSE_UPLOAD_FAIL     = 'COMPOSE_UPLOAD_FAIL' as const;
const COMPOSE_UPLOAD_PROGRESS = 'COMPOSE_UPLOAD_PROGRESS' as const;
const COMPOSE_UPLOAD_UNDO     = 'COMPOSE_UPLOAD_UNDO' as const;
const COMPOSE_GROUP_POST      = 'COMPOSE_GROUP_POST' as const;

const COMPOSE_SUGGESTIONS_CLEAR = 'COMPOSE_SUGGESTIONS_CLEAR' as const;
const COMPOSE_SUGGESTIONS_READY = 'COMPOSE_SUGGESTIONS_READY' as const;
const COMPOSE_SUGGESTION_SELECT = 'COMPOSE_SUGGESTION_SELECT' as const;
const COMPOSE_SUGGESTION_TAGS_UPDATE = 'COMPOSE_SUGGESTION_TAGS_UPDATE' as const;

const COMPOSE_TAG_HISTORY_UPDATE = 'COMPOSE_TAG_HISTORY_UPDATE' as const;

const COMPOSE_SPOILERNESS_CHANGE = 'COMPOSE_SPOILERNESS_CHANGE' as const;
const COMPOSE_TYPE_CHANGE = 'COMPOSE_TYPE_CHANGE' as const;
const COMPOSE_SPOILER_TEXT_CHANGE = 'COMPOSE_SPOILER_TEXT_CHANGE' as const;
const COMPOSE_VISIBILITY_CHANGE  = 'COMPOSE_VISIBILITY_CHANGE' as const;
const COMPOSE_LISTABILITY_CHANGE = 'COMPOSE_LISTABILITY_CHANGE' as const;

const COMPOSE_EMOJI_INSERT = 'COMPOSE_EMOJI_INSERT' as const;

const COMPOSE_UPLOAD_CHANGE_REQUEST     = 'COMPOSE_UPLOAD_UPDATE_REQUEST' as const;
const COMPOSE_UPLOAD_CHANGE_SUCCESS     = 'COMPOSE_UPLOAD_UPDATE_SUCCESS' as const;
const COMPOSE_UPLOAD_CHANGE_FAIL        = 'COMPOSE_UPLOAD_UPDATE_FAIL' as const;

const COMPOSE_POLL_ADD             = 'COMPOSE_POLL_ADD' as const;
const COMPOSE_POLL_REMOVE          = 'COMPOSE_POLL_REMOVE' as const;
const COMPOSE_POLL_OPTION_ADD      = 'COMPOSE_POLL_OPTION_ADD' as const;
const COMPOSE_POLL_OPTION_CHANGE   = 'COMPOSE_POLL_OPTION_CHANGE' as const;
const COMPOSE_POLL_OPTION_REMOVE   = 'COMPOSE_POLL_OPTION_REMOVE' as const;
const COMPOSE_POLL_SETTINGS_CHANGE = 'COMPOSE_POLL_SETTINGS_CHANGE' as const;

const COMPOSE_SCHEDULE_ADD    = 'COMPOSE_SCHEDULE_ADD' as const;
const COMPOSE_SCHEDULE_SET    = 'COMPOSE_SCHEDULE_SET' as const;
const COMPOSE_SCHEDULE_REMOVE = 'COMPOSE_SCHEDULE_REMOVE' as const;

const COMPOSE_ADD_TO_MENTIONS = 'COMPOSE_ADD_TO_MENTIONS' as const;
const COMPOSE_REMOVE_FROM_MENTIONS = 'COMPOSE_REMOVE_FROM_MENTIONS' as const;

const COMPOSE_SET_STATUS = 'COMPOSE_SET_STATUS' as const;

const COMPOSE_EDITOR_STATE_SET = 'COMPOSE_EDITOR_STATE_SET' as const;

const COMPOSE_CHANGE_MEDIA_ORDER = 'COMPOSE_CHANGE_MEDIA_ORDER' as const;

const COMPOSE_ADD_SUGGESTED_QUOTE      = 'COMPOSE_ADD_SUGGESTED_QUOTE' as const;

const getAccount = makeGetAccount();

const messages = defineMessages({
  scheduleError: { id: 'compose.invalid_schedule', defaultMessage: 'You must schedule a post at least 5 minutes out.' },
  success: { id: 'compose.submit_success', defaultMessage: 'Your post was sent!' },
  editSuccess: { id: 'compose.edit_success', defaultMessage: 'Your post was edited' },
  uploadErrorLimit: { id: 'upload_error.limit', defaultMessage: 'File upload limit exceeded.' },
  uploadErrorPoll: { id: 'upload_error.poll', defaultMessage: 'File upload not allowed with polls.' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: { id: 'confirmations.reply.message', defaultMessage: 'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?' },
});

interface ComposeSetStatusAction {
  type: typeof COMPOSE_SET_STATUS;
  id: string;
  status: Status;
  rawText: string;
  explicitAddressing: boolean;
  spoilerText?: string;
  contentType?: string | false;
  v: ReturnType<typeof parseVersion>;
  withRedraft?: boolean;
  draftId?: string;
  editorState?: string | null;
}

const setComposeToStatus = (status: Status, rawText: string, spoilerText?: string, contentType?: string | false, withRedraft?: boolean, draftId?: string, editorState?: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { instance } = getState();
    const { explicitAddressing } = getFeatures(instance);

    const action: ComposeSetStatusAction = {
      type: COMPOSE_SET_STATUS,
      id: 'compose-modal',
      status,
      rawText,
      explicitAddressing,
      spoilerText,
      contentType,
      v: parseVersion(instance.version),
      withRedraft,
      draftId,
      editorState,
    };

    dispatch(action);
  };

const changeCompose = (composeId: string, text: string) => ({
  type: COMPOSE_CHANGE,
  id: composeId,
  text: text,
});

interface ComposeReplyAction {
  type: typeof COMPOSE_REPLY;
  id: string;
  status: Status;
  account: Account;
  explicitAddressing: boolean;
  preserveSpoilers: boolean;
  rebloggedBy?: Account;
}

const replyCompose = (status: Status, rebloggedBy?: Account) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const instance = state.instance;
    const { explicitAddressing } = getFeatures(instance);
    const preserveSpoilers = !!getSettings(state).get('preserveSpoilers');
    const account = selectOwnAccount(state);

    if (!account) return;

    const action: ComposeReplyAction = {
      type: COMPOSE_REPLY,
      id: 'compose-modal',
      status: status,
      account,
      explicitAddressing,
      preserveSpoilers,
      rebloggedBy: rebloggedBy,
    };

    dispatch(action);
    dispatch(openModal('COMPOSE'));
  };

const cancelReplyCompose = () => ({
  type: COMPOSE_REPLY_CANCEL,
  id: 'compose-modal',
});

interface ComposeQuoteAction {
  type: typeof COMPOSE_QUOTE;
  id: string;
  status: Status;
  account: Account | undefined;
  explicitAddressing: boolean;
}

const quoteCompose = (status: Status) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const instance = state.instance;
    const { explicitAddressing } = getFeatures(instance);

    const action: ComposeQuoteAction = {
      type: COMPOSE_QUOTE,
      id: 'compose-modal',
      status: status,
      account: selectOwnAccount(state),
      explicitAddressing,
    };

    dispatch(action);
    dispatch(openModal('COMPOSE'));
  };

const cancelQuoteCompose = (composeId: string) => ({
  type: COMPOSE_QUOTE_CANCEL,
  id: composeId,
});

const groupComposeModal = (group: Group) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const composeId = `group:${group.id}`;

    dispatch(groupCompose(composeId, group.id));
    dispatch(openModal('COMPOSE', { composeId }));
  };

const resetCompose = (composeId = 'compose-modal') => ({
  type: COMPOSE_RESET,
  id: composeId,
});

interface ComposeMentionAction {
  type: typeof COMPOSE_MENTION;
  id: string;
  account: Account;
}

const mentionCompose = (account: Account) =>
  (dispatch: AppDispatch) => {
    const action: ComposeMentionAction = {
      type: COMPOSE_MENTION,
      id: 'compose-modal',
      account: account,
    };

    dispatch(action);
    dispatch(openModal('COMPOSE'));
  };

interface ComposeDirectAction {
  type: typeof COMPOSE_DIRECT;
  id: string;
  account: Account;
}

const directCompose = (account: Account) =>
  (dispatch: AppDispatch) => {
    const action: ComposeDirectAction = {
      type: COMPOSE_DIRECT,
      id: 'compose-modal',
      account,
    };

    dispatch(action);
    dispatch(openModal('COMPOSE'));
  };

const directComposeById = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const account = selectAccount(getState(), accountId);
    if (!account) return;

    const action: ComposeDirectAction = {
      type: COMPOSE_DIRECT,
      id: 'compose-modal',
      account,
    };

    dispatch(action);
    dispatch(openModal('COMPOSE'));
  };

const handleComposeSubmit = (dispatch: AppDispatch, getState: () => RootState, composeId: string, data: APIEntity, status: string, edit?: boolean) => {
  if (!dispatch || !getState) return;

  const state = getState();

  const accountUrl = getAccount(state, state.me as string)!.url;
  const draftId = getState().compose.get(composeId)!.draft_id;

  dispatch(insertIntoTagHistory(composeId, data.tags || [], status));
  dispatch(submitComposeSuccess(composeId, { ...data }, accountUrl, draftId));
  toast.success(edit ? messages.editSuccess : messages.success, {
    actionLabel: messages.view,
    actionLink: `/@${data.account.acct}/posts/${data.id}`,
  });
};

const needsDescriptions = (state: RootState, composeId: string) => {
  const media  = state.compose.get(composeId)!.media_attachments;
  const missingDescriptionModal = getSettings(state).get('missingDescriptionModal');

  const hasMissing = media.filter(item => !item.description).size > 0;

  return missingDescriptionModal && hasMissing;
};

const validateSchedule = (state: RootState, composeId: string) => {
  const schedule = state.compose.get(composeId)?.schedule;
  if (!schedule) return true;

  const fiveMinutesFromNow = new Date(new Date().getTime() + 300000);

  return schedule.getTime() > fiveMinutesFromNow.getTime();
};

interface SubmitComposeOpts {
  history?: History;
  force?: boolean;
}

const submitCompose = (composeId: string, opts: SubmitComposeOpts = {}) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const { history, force = false } = opts;

    if (!isLoggedIn(getState)) return;
    const state = getState();

    const compose = state.compose.get(composeId)!;

    const status   = compose.text;
    const media    = compose.media_attachments;
    const statusId = compose.id;
    let to         = compose.to;

    if (!validateSchedule(state, composeId)) {
      toast.error(messages.scheduleError);
      return;
    }

    if ((!status || !status.length) && media.size === 0) {
      return;
    }

    if (!force && needsDescriptions(state, composeId)) {
      dispatch(openModal('MISSING_DESCRIPTION', {
        onContinue: () => {
          dispatch(closeModal('MISSING_DESCRIPTION'));
          dispatch(submitCompose(composeId, { history, force: true }));
        },
      }));
      return;
    }

    const mentions: string[] | null = status.match(/(?:^|\s)@([a-z\d_-]+(?:@[^@\s]+)?)/gi);

    if (mentions) {
      to = to.union(mentions.map(mention => mention.trim().slice(1)));
    }

    dispatch(submitComposeRequest(composeId));
    dispatch(closeModal());

    const idempotencyKey = compose.idempotencyKey;

    const params: Record<string, any> = {
      status,
      in_reply_to_id: compose.in_reply_to,
      quote_id: compose.quote,
      media_ids: media.map(item => item.id),
      sensitive: compose.sensitive,
      spoiler_text: compose.spoiler_text,
      visibility: compose.privacy,
      content_type: compose.content_type,
      poll: compose.poll,
      scheduled_at: compose.schedule,
      to,
    };

    if (compose.privacy === 'group') {
      params.group_id = compose.group_id;
    }

    return dispatch(createStatus(params, idempotencyKey, statusId)).then(function(data) {
      if (!statusId && data.visibility === 'direct' && getState().conversations.mounted <= 0 && history) {
        history.push('/messages');
      }
      handleComposeSubmit(dispatch, getState, composeId, data, status, !!statusId);
    }).catch(function(error) {
      dispatch(submitComposeFail(composeId, error));
    });
  };

const submitComposeRequest = (composeId: string) => ({
  type: COMPOSE_SUBMIT_REQUEST,
  id: composeId,
});

const submitComposeSuccess = (composeId: string, status: APIEntity, accountUrl: string, draftId?: string | null) => ({
  type: COMPOSE_SUBMIT_SUCCESS,
  id: composeId,
  status: status,
  accountUrl,
  draftId,
});

const submitComposeFail = (composeId: string, error: unknown) => ({
  type: COMPOSE_SUBMIT_FAIL,
  id: composeId,
  error: error,
});

const uploadCompose = (composeId: string, files: FileList, intl: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;
    const attachmentLimit = getState().instance.configuration.statuses.max_media_attachments;

    const media  = getState().compose.get(composeId)?.media_attachments;
    const progress = new Array(files.length).fill(0);
    let total = Array.from(files).reduce((a, v) => a + v.size, 0);

    const mediaCount = media ? media.size : 0;

    if (files.length + mediaCount > attachmentLimit) {
      toast.error(messages.uploadErrorLimit);
      return;
    }

    dispatch(uploadComposeRequest(composeId));

    Array.from(files).forEach(async(f, i) => {
      if (mediaCount + i > attachmentLimit - 1) return;

      dispatch(uploadFile(
        f,
        intl,
        (data) => dispatch(uploadComposeSuccess(composeId, data, f)),
        (error) => dispatch(uploadComposeFail(composeId, error)),
        ({ loaded }: any) => {
          progress[i] = loaded;
          dispatch(uploadComposeProgress(composeId, progress.reduce((a, v) => a + v, 0), total));
        },
        (value) => total += value,
      ));

    });
  };

const uploadComposeRequest = (composeId: string) => ({
  type: COMPOSE_UPLOAD_REQUEST,
  id: composeId,
  skipLoading: true,
});

const uploadComposeProgress = (composeId: string, loaded: number, total: number) => ({
  type: COMPOSE_UPLOAD_PROGRESS,
  id: composeId,
  loaded: loaded,
  total: total,
});

const uploadComposeSuccess = (composeId: string, media: APIEntity, file: File) => ({
  type: COMPOSE_UPLOAD_SUCCESS,
  id: composeId,
  media: media,
  file,
  skipLoading: true,
});

const uploadComposeFail = (composeId: string, error: unknown) => ({
  type: COMPOSE_UPLOAD_FAIL,
  id: composeId,
  error: error,
  skipLoading: true,
});

const changeUploadCompose = (composeId: string, id: string, params: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(changeUploadComposeRequest(composeId));

    dispatch(updateMedia(id, params)).then(response => {
      dispatch(changeUploadComposeSuccess(composeId, response.json));
    }).catch(error => {
      dispatch(changeUploadComposeFail(composeId, id, error));
    });
  };

const changeUploadComposeRequest = (composeId: string) => ({
  type: COMPOSE_UPLOAD_CHANGE_REQUEST,
  id: composeId,
  skipLoading: true,
});

const changeUploadComposeSuccess = (composeId: string, media: APIEntity) => ({
  type: COMPOSE_UPLOAD_CHANGE_SUCCESS,
  id: composeId,
  media: media,
  skipLoading: true,
});

const changeUploadComposeFail = (composeId: string, id: string, error: unknown) => ({
  type: COMPOSE_UPLOAD_CHANGE_FAIL,
  composeId,
  id,
  error: error,
  skipLoading: true,
});

const undoUploadCompose = (composeId: string, media_id: string) => ({
  type: COMPOSE_UPLOAD_UNDO,
  id: composeId,
  media_id: media_id,
});

const groupCompose = (composeId: string, groupId: string) => ({
  type: COMPOSE_GROUP_POST,
  id: composeId,
  group_id: groupId,
});

const clearComposeSuggestions = (composeId: string) => {
  if (cancelFetchComposeSuggestions) {
    cancelFetchComposeSuggestions.abort();
    cancelFetchComposeSuggestions = new AbortController();
  }
  return {
    type: COMPOSE_SUGGESTIONS_CLEAR,
    id: composeId,
  };
};

const fetchComposeSuggestionsAccounts = throttle((dispatch, getState, composeId, token) => {
  const signal = cancelFetchComposeSuggestions.signal;

  if (cancelFetchComposeSuggestions) {
    cancelFetchComposeSuggestions.abort();
    cancelFetchComposeSuggestions = new AbortController();
  }

  api(getState)('/api/v1/accounts/search', {
    params: {
      q: token.slice(1),
      resolve: false,
      limit: 10,
    },
    signal: cancelFetchComposeSuggestions.signal,
  }).then(response => {
    dispatch(importFetchedAccounts(response.json));
    dispatch(readyComposeSuggestionsAccounts(composeId, token, response.json));
  }).catch(error => {
    if (!signal.aborted) {
      toast.showAlertForError(error);
    }
  });
}, 200, { leading: true, trailing: true });

const fetchComposeSuggestionsEmojis = (dispatch: AppDispatch, getState: () => RootState, composeId: string, token: string) => {
  const state = getState();
  const results = emojiSearch(token.replace(':', ''), { maxResults: 10 }, state.custom_emojis);

  dispatch(readyComposeSuggestionsEmojis(composeId, token, results));
};

const fetchComposeSuggestionsTags = (dispatch: AppDispatch, getState: () => RootState, composeId: string, token: string) => {
  const signal = cancelFetchComposeSuggestions.signal;

  if (cancelFetchComposeSuggestions) {
    cancelFetchComposeSuggestions.abort();
    cancelFetchComposeSuggestions = new AbortController();
  }

  const state = getState();

  const instance = state.instance;
  const { trends } = getFeatures(instance);

  if (trends) {
    const currentTrends = state.trends.items;

    return dispatch(updateSuggestionTags(composeId, token, currentTrends));
  }

  api(getState)('/api/v2/search', {
    params: {
      q: token.slice(1),
      limit: 10,
      type: 'hashtags',
    },
    signal: cancelFetchComposeSuggestions.signal,
  }).then(response => {
    dispatch(updateSuggestionTags(composeId, token, response.json?.hashtags.map(normalizeTag)));
  }).catch(error => {
    if (!signal.aborted) {
      toast.showAlertForError(error);
    }
  });
};

const fetchComposeSuggestions = (composeId: string, token: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    switch (token[0]) {
      case ':':
        fetchComposeSuggestionsEmojis(dispatch, getState, composeId, token);
        break;
      case '#':
        fetchComposeSuggestionsTags(dispatch, getState, composeId, token);
        break;
      default:
        fetchComposeSuggestionsAccounts(dispatch, getState, composeId, token);
        break;
    }
  };

interface ComposeSuggestionsReadyAction {
  type: typeof COMPOSE_SUGGESTIONS_READY;
  id: string;
  token: string;
  emojis?: Emoji[];
  accounts?: APIEntity[];
}

const readyComposeSuggestionsEmojis = (composeId: string, token: string, emojis: Emoji[]) => ({
  type: COMPOSE_SUGGESTIONS_READY,
  id: composeId,
  token,
  emojis,
});

const readyComposeSuggestionsAccounts = (composeId: string, token: string, accounts: APIEntity[]) => ({
  type: COMPOSE_SUGGESTIONS_READY,
  id: composeId,
  token,
  accounts,
});

interface ComposeSuggestionSelectAction {
  type: typeof COMPOSE_SUGGESTION_SELECT;
  id: string;
  position: number;
  token: string | null;
  completion: string;
  path: Array<string | number>;
}

const selectComposeSuggestion = (composeId: string, position: number, token: string | null, suggestion: AutoSuggestion, path: Array<string | number>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    let completion = '', startPosition = position;

    if (typeof suggestion === 'object' && suggestion.id) {
      completion    = isNativeEmoji(suggestion) ? suggestion.native : suggestion.colons;
      startPosition = position - 1;

      dispatch(chooseEmoji(suggestion));
    } else if (typeof suggestion === 'string' && suggestion[0] === '#') {
      completion    = suggestion;
      startPosition = position - 1;
    } else if (typeof suggestion === 'string') {
      completion    = selectAccount(getState(), suggestion)!.acct;
      startPosition = position;
    }

    const action: ComposeSuggestionSelectAction = {
      type: COMPOSE_SUGGESTION_SELECT,
      id: composeId,
      position: startPosition,
      token,
      completion,
      path,
    };

    dispatch(action);
  };

const updateSuggestionTags = (composeId: string, token: string, tags: ImmutableList<Tag>) => ({
  type: COMPOSE_SUGGESTION_TAGS_UPDATE,
  id: composeId,
  token,
  tags,
});

const updateTagHistory = (composeId: string, tags: string[]) => ({
  type: COMPOSE_TAG_HISTORY_UPDATE,
  id: composeId,
  tags,
});

const insertIntoTagHistory = (composeId: string, recognizedTags: APIEntity[], text: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const oldHistory = state.compose.get(composeId)!.tagHistory;
    const me = state.me;
    const names = recognizedTags
      .filter(tag => text.match(new RegExp(`#${tag.name}`, 'i')))
      .map(tag => tag.name);
    const intersectedOldHistory = oldHistory.filter(name => names.findIndex(newName => newName.toLowerCase() === name.toLowerCase()) === -1);

    names.push(...intersectedOldHistory.toJS());

    const newHistory = names.slice(0, 1000);

    tagHistory.set(me as string, newHistory);
    dispatch(updateTagHistory(composeId, newHistory));
  };

const changeComposeSpoilerness = (composeId: string) => ({
  type: COMPOSE_SPOILERNESS_CHANGE,
  id: composeId,
});

const changeComposeContentType = (composeId: string, value: string) => ({
  type: COMPOSE_TYPE_CHANGE,
  id: composeId,
  value,
});

const changeComposeSpoilerText = (composeId: string, text: string) => ({
  type: COMPOSE_SPOILER_TEXT_CHANGE,
  id: composeId,
  text,
});

const changeComposeVisibility = (composeId: string, value: string) => ({
  type: COMPOSE_VISIBILITY_CHANGE,
  id: composeId,
  value,
});

const insertEmojiCompose = (composeId: string, position: number, emoji: Emoji, needsSpace: boolean) => ({
  type: COMPOSE_EMOJI_INSERT,
  id: composeId,
  position,
  emoji,
  needsSpace,
});

const addPoll = (composeId: string) => ({
  type: COMPOSE_POLL_ADD,
  id: composeId,
});

const removePoll = (composeId: string) => ({
  type: COMPOSE_POLL_REMOVE,
  id: composeId,
});

const addSchedule = (composeId: string) => ({
  type: COMPOSE_SCHEDULE_ADD,
  id: composeId,
});

const setSchedule = (composeId: string, date: Date) => ({
  type: COMPOSE_SCHEDULE_SET,
  id: composeId,
  date: date,
});

const removeSchedule = (composeId: string) => ({
  type: COMPOSE_SCHEDULE_REMOVE,
  id: composeId,
});

const addPollOption = (composeId: string, title: string) => ({
  type: COMPOSE_POLL_OPTION_ADD,
  id: composeId,
  title,
});

const changePollOption = (composeId: string, index: number, title: string) => ({
  type: COMPOSE_POLL_OPTION_CHANGE,
  id: composeId,
  index,
  title,
});

const removePollOption = (composeId: string, index: number) => ({
  type: COMPOSE_POLL_OPTION_REMOVE,
  id: composeId,
  index,
});

const changePollSettings = (composeId: string, expiresIn?: number, isMultiple?: boolean) => ({
  type: COMPOSE_POLL_SETTINGS_CHANGE,
  id: composeId,
  expiresIn,
  isMultiple,
});

const openComposeWithText = (composeId: string, text = '') =>
  (dispatch: AppDispatch) => {
    dispatch(resetCompose(composeId));
    dispatch(openModal('COMPOSE'));
    dispatch(changeCompose(composeId, text));
  };

interface ComposeAddToMentionsAction {
  type: typeof COMPOSE_ADD_TO_MENTIONS;
  id: string;
  account: string;
}

const addToMentions = (composeId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const account = selectAccount(state, accountId);
    if (!account) return;

    const action: ComposeAddToMentionsAction = {
      type: COMPOSE_ADD_TO_MENTIONS,
      id: composeId,
      account: account.acct,
    };

    return dispatch(action);
  };

interface ComposeRemoveFromMentionsAction {
  type: typeof COMPOSE_REMOVE_FROM_MENTIONS;
  id: string;
  account: string;
}

const removeFromMentions = (composeId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const account = selectAccount(state, accountId);
    if (!account) return;

    const action: ComposeRemoveFromMentionsAction = {
      type: COMPOSE_REMOVE_FROM_MENTIONS,
      id: composeId,
      account: account.acct,
    };

    return dispatch(action);
  };

interface ComposeEventReplyAction {
  type: typeof COMPOSE_EVENT_REPLY;
  id: string;
  status: Status;
  account: Account;
  explicitAddressing: boolean;
}

const eventDiscussionCompose = (composeId: string, status: Status) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const instance = state.instance;
    const { explicitAddressing } = getFeatures(instance);

    return dispatch({
      type: COMPOSE_EVENT_REPLY,
      id: composeId,
      status: status,
      account: selectOwnAccount(state),
      explicitAddressing,
    });
  };

const setEditorState = (composeId: string, editorState: EditorState | string | null, text?: string) => ({
  type: COMPOSE_EDITOR_STATE_SET,
  id: composeId,
  editorState: editorState,
  text,
});

const changeMediaOrder = (composeId: string, a: string, b: string) => ({
  type: COMPOSE_CHANGE_MEDIA_ORDER,
  id: composeId,
  a,
  b,
});

const addSuggestedQuote = (composeId: string, quoteId: string) => ({
  type: COMPOSE_ADD_SUGGESTED_QUOTE,
  id: composeId,
  quoteId: quoteId,
});

type ComposeAction =
  ComposeSetStatusAction
  | ReturnType<typeof changeCompose>
  | ComposeReplyAction
  | ReturnType<typeof cancelReplyCompose>
  | ComposeQuoteAction
  | ReturnType<typeof cancelQuoteCompose>
  | ReturnType<typeof resetCompose>
  | ComposeMentionAction
  | ComposeDirectAction
  | ReturnType<typeof submitComposeRequest>
  | ReturnType<typeof submitComposeSuccess>
  | ReturnType<typeof submitComposeFail>
  | ReturnType<typeof changeUploadComposeRequest>
  | ReturnType<typeof changeUploadComposeSuccess>
  | ReturnType<typeof changeUploadComposeFail>
  | ReturnType<typeof uploadComposeRequest>
  | ReturnType<typeof uploadComposeProgress>
  | ReturnType<typeof uploadComposeSuccess>
  | ReturnType<typeof uploadComposeFail>
  | ReturnType<typeof undoUploadCompose>
  | ReturnType<typeof groupCompose>
  | ReturnType<typeof clearComposeSuggestions>
  | ComposeSuggestionsReadyAction
  | ComposeSuggestionSelectAction
  | ReturnType<typeof updateSuggestionTags>
  | ReturnType<typeof updateTagHistory>
  | ReturnType<typeof changeComposeSpoilerness>
  | ReturnType<typeof changeComposeContentType>
  | ReturnType<typeof changeComposeSpoilerText>
  | ReturnType<typeof changeComposeVisibility>
  | ReturnType<typeof insertEmojiCompose>
  | ReturnType<typeof addPoll>
  | ReturnType<typeof removePoll>
  | ReturnType<typeof addSchedule>
  | ReturnType<typeof setSchedule>
  | ReturnType<typeof removeSchedule>
  | ReturnType<typeof addPollOption>
  | ReturnType<typeof changePollOption>
  | ReturnType<typeof removePollOption>
  | ReturnType<typeof changePollSettings>
  | ComposeAddToMentionsAction
  | ComposeRemoveFromMentionsAction
  | ComposeEventReplyAction
  | ReturnType<typeof setEditorState>
  | ReturnType<typeof changeMediaOrder>
  | ReturnType<typeof addSuggestedQuote>

export {
  COMPOSE_CHANGE,
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,
  COMPOSE_REPLY,
  COMPOSE_REPLY_CANCEL,
  COMPOSE_EVENT_REPLY,
  COMPOSE_QUOTE,
  COMPOSE_QUOTE_CANCEL,
  COMPOSE_DIRECT,
  COMPOSE_MENTION,
  COMPOSE_RESET,
  COMPOSE_UPLOAD_REQUEST,
  COMPOSE_UPLOAD_SUCCESS,
  COMPOSE_UPLOAD_FAIL,
  COMPOSE_UPLOAD_PROGRESS,
  COMPOSE_UPLOAD_UNDO,
  COMPOSE_GROUP_POST,
  COMPOSE_SUGGESTIONS_CLEAR,
  COMPOSE_SUGGESTIONS_READY,
  COMPOSE_SUGGESTION_SELECT,
  COMPOSE_SUGGESTION_TAGS_UPDATE,
  COMPOSE_TAG_HISTORY_UPDATE,
  COMPOSE_SPOILERNESS_CHANGE,
  COMPOSE_TYPE_CHANGE,
  COMPOSE_SPOILER_TEXT_CHANGE,
  COMPOSE_VISIBILITY_CHANGE,
  COMPOSE_LISTABILITY_CHANGE,
  COMPOSE_EMOJI_INSERT,
  COMPOSE_UPLOAD_CHANGE_REQUEST,
  COMPOSE_UPLOAD_CHANGE_SUCCESS,
  COMPOSE_UPLOAD_CHANGE_FAIL,
  COMPOSE_POLL_ADD,
  COMPOSE_POLL_REMOVE,
  COMPOSE_POLL_OPTION_ADD,
  COMPOSE_POLL_OPTION_CHANGE,
  COMPOSE_POLL_OPTION_REMOVE,
  COMPOSE_POLL_SETTINGS_CHANGE,
  COMPOSE_SCHEDULE_ADD,
  COMPOSE_SCHEDULE_SET,
  COMPOSE_SCHEDULE_REMOVE,
  COMPOSE_ADD_TO_MENTIONS,
  COMPOSE_REMOVE_FROM_MENTIONS,
  COMPOSE_SET_STATUS,
  COMPOSE_EDITOR_STATE_SET,
  COMPOSE_CHANGE_MEDIA_ORDER,
  COMPOSE_ADD_SUGGESTED_QUOTE,
  setComposeToStatus,
  changeCompose,
  replyCompose,
  cancelReplyCompose,
  quoteCompose,
  cancelQuoteCompose,
  resetCompose,
  mentionCompose,
  directCompose,
  directComposeById,
  handleComposeSubmit,
  submitCompose,
  submitComposeRequest,
  submitComposeSuccess,
  submitComposeFail,
  uploadFile,
  uploadCompose,
  changeUploadCompose,
  changeUploadComposeRequest,
  changeUploadComposeSuccess,
  changeUploadComposeFail,
  uploadComposeRequest,
  uploadComposeProgress,
  uploadComposeSuccess,
  uploadComposeFail,
  undoUploadCompose,
  groupCompose,
  groupComposeModal,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  readyComposeSuggestionsEmojis,
  readyComposeSuggestionsAccounts,
  selectComposeSuggestion,
  updateSuggestionTags,
  updateTagHistory,
  changeComposeSpoilerness,
  changeComposeContentType,
  changeComposeSpoilerText,
  changeComposeVisibility,
  insertEmojiCompose,
  addPoll,
  removePoll,
  addSchedule,
  setSchedule,
  removeSchedule,
  addPollOption,
  changePollOption,
  removePollOption,
  changePollSettings,
  openComposeWithText,
  addToMentions,
  removeFromMentions,
  eventDiscussionCompose,
  setEditorState,
  changeMediaOrder,
  addSuggestedQuote,
  type ComposeAction,
};

import { saveSettings } from './settings';

import type { Emoji } from 'pl-fe/features/emoji';
import type { AppDispatch } from 'pl-fe/store';

const EMOJI_CHOOSE = 'EMOJI_CHOOSE';

const chooseEmoji = (emoji: Emoji) => (dispatch: AppDispatch) => {
  dispatch({
    type: EMOJI_CHOOSE,
    emoji,
  });

  dispatch(saveSettings());
};

export { EMOJI_CHOOSE, chooseEmoji };

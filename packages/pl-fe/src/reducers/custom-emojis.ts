import { buildCustomEmojis } from 'soapbox/features/emoji';
import emojiData from 'soapbox/features/emoji/data';
import { addCustomToPool } from 'soapbox/features/emoji/search';

import { CUSTOM_EMOJIS_FETCH_SUCCESS, type CustomEmojisAction } from '../actions/custom-emojis';

import type { CustomEmoji } from 'pl-api';

const initialState: Array<CustomEmoji> = [];

// Populate custom emojis for composer autosuggest
const autosuggestPopulate = (emojis: Array<CustomEmoji>) => {
  addCustomToPool(buildCustomEmojis(emojis));
};

const importEmojis = (customEmojis: Array<CustomEmoji>) => {
  const emojis = customEmojis.filter((emoji) => {
    // If a custom emoji has the shortcode of a Unicode emoji, skip it.
    // Otherwise it breaks EmojiMart.
    // https://gitlab.com/soapbox-pub/soapbox/-/issues/610
    const shortcode = emoji.shortcode.toLowerCase();
    return !emojiData.emojis[shortcode];
  });

  autosuggestPopulate(emojis);
  return emojis;
};

const custom_emojis = (state = initialState, action: CustomEmojisAction) => {
  if (action.type === CUSTOM_EMOJIS_FETCH_SUCCESS) {
    return importEmojis(action.custom_emojis);
  }

  return state;
};

export { custom_emojis as default };

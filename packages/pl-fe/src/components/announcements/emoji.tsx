import React from 'react';

import unicodeMapping from 'pl-fe/features/emoji/mapping';
import { useSettings } from 'pl-fe/hooks';
import { joinPublicPath } from 'pl-fe/utils/static';

import type { Map as ImmutableMap } from 'immutable';
import type { CustomEmoji } from 'pl-api';

interface IEmoji {
  emoji: string;
  emojiMap: ImmutableMap<string, CustomEmoji>;
  hovered: boolean;
}

const Emoji: React.FC<IEmoji> = ({ emoji, emojiMap, hovered }) => {
  const { autoPlayGif } = useSettings();

  // @ts-ignore
  if (unicodeMapping[emoji]) {
    // @ts-ignore
    const { filename, shortCode } = unicodeMapping[emoji];
    const title = shortCode ? `:${shortCode}:` : '';

    return (
      <img
        draggable='false'
        className='emojione m-0 block'
        alt={emoji}
        title={title}
        src={joinPublicPath(`packs/emoji/${filename}.svg`)}
      />
    );
  } else if (emojiMap.get(emoji as any)) {
    const filename = (autoPlayGif || hovered) ? emojiMap.getIn([emoji, 'url']) : emojiMap.getIn([emoji, 'static_url']);
    const shortCode = `:${emoji}:`;

    return (
      <img
        draggable='false'
        className='emojione m-0 block'
        alt={shortCode}
        title={shortCode}
        src={filename as string}
      />
    );
  } else {
    return null;
  }
};

export { Emoji as default };

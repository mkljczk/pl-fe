import emojify from 'pl-fe/features/emoji';
import { stripCompatibilityFeatures } from 'pl-fe/utils/html';
import { makeEmojiMap } from 'pl-fe/utils/normalizers';

import type { Translation as BaseTranslation, Status } from 'pl-api';

const normalizeTranslation = (
  translation: BaseTranslation,
  status: Pick<Status, 'emojis'>,
) => {
  const emojiMap = makeEmojiMap(status.emojis);
  const content = stripCompatibilityFeatures(
    emojify(translation.content, emojiMap),
  );

  return {
    ...translation,
    content,
  };
};

type Translation = ReturnType<typeof normalizeTranslation>;

export { normalizeTranslation, type Translation };

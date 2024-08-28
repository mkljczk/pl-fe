import clsx from 'clsx';
import React from 'react';
import { length } from 'stringz';

interface ITextCharacterCounter {
  max: number;
  text: string;
}

const TextCharacterCounter: React.FC<ITextCharacterCounter> = ({ text, max }) => {
  const checkRemainingText = (diff: number) => (
    <span
      className={clsx('text-sm font-medium', {
        'text-gray-700': diff >= 0,
        'text-secondary-600': diff < 0,
      })}
    >
      {diff}
    </span>
  );

  const diff = max - length(text);
  return checkRemainingText(diff);
};

export { TextCharacterCounter as default };

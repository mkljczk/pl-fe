import React from 'react';

import { generateText, randomIntFromInterval } from '../utils';

interface IPlaceholderStatusContent {
  maxLength: number;
  minLength: number;
}

/** Fake status content while data is loading. */
const PlaceholderStatusContent: React.FC<IPlaceholderStatusContent> = ({
  minLength,
  maxLength,
}) => {
  const length = randomIntFromInterval(maxLength, minLength);

  return (
    <div className='flex flex-col text-primary-50 dark:text-primary-800'>
      <p className='break-words'>{generateText(length)}</p>
    </div>
  );
};

export { PlaceholderStatusContent as default };

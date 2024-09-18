import React from 'react';

import { generateText, randomIntFromInterval } from '../utils';

interface IPlaceholderDisplayName {
  maxLength: number;
  minLength: number;
  withSuffix?: boolean;
}

/** Fake display name to show when data is loading. */
const PlaceholderDisplayName: React.FC<IPlaceholderDisplayName> = React.memo(
  ({ minLength, maxLength, withSuffix = true }) => {
    const length = randomIntFromInterval(maxLength, minLength);
    const acctLength = randomIntFromInterval(maxLength, minLength);

    return (
      <div className='flex flex-col text-primary-50 dark:text-primary-800'>
        <p>{generateText(length)}</p>
        {withSuffix && <p>{generateText(acctLength)}</p>}
      </div>
    );
  },
);

export { PlaceholderDisplayName as default };

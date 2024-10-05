import React from 'react';

import AnimatedNumber from 'pl-fe/components/animated-number';

interface ICounter {
  /** Number this counter should display. */
  count: number;
  /** Optional max number (ie: N+) */
  countMax?: number;
}

/** A simple counter for notifications, etc. */
const Counter: React.FC<ICounter> = ({ count, countMax }) => (
  <span className='flex h-5 min-w-[20px] max-w-[26px] items-center justify-center rounded-full bg-secondary-500 text-xs font-medium text-white ring-2 ring-white black:ring-black dark:ring-gray-800'>
    <AnimatedNumber value={count} max={countMax} />
  </span>
);

export { Counter as default };

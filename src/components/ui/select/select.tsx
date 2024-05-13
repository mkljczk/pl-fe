import clsx from 'clsx';
import React from 'react';

interface ISelect extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: Iterable<React.ReactNode>;
  full?: boolean;
}

/** Multiple-select dropdown. */
const Select = React.forwardRef<HTMLSelectElement, ISelect>((props, ref) => {
  const { children, className, full = true, ...filteredProps } = props;

  return (
    <select
      ref={ref}
      className={clsx(
        'truncate rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 disabled:opacity-50 black:bg-black sm:text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:ring-1 dark:ring-gray-800 dark:focus:border-primary-500 dark:focus:ring-primary-500',
        className,
        {
          'w-full': full,
        },
      )}
      {...filteredProps}
    >
      {children}
    </select>
  );
});

export { Select as default };

import clsx from 'clsx';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { Icon, Text } from './ui';

interface ISidebarNavigationLink {
  /** Notification count, if any. */
  count?: number;
  /** Optional max to cap count (ie: N+) */
  countMax?: number;
  /** URL to an SVG icon. */
  icon: string;
  /** URL to an SVG icon for active state. */
  activeIcon?: string;
  /** Link label. */
  text: React.ReactNode;
  /** Route to an internal page. */
  to?: string;
  /** Callback when the link is clicked. */
  onClick?: React.EventHandler<React.MouseEvent>;
}

/** Desktop sidebar navigation link. */
const SidebarNavigationLink = React.forwardRef((props: ISidebarNavigationLink, ref: React.ForwardedRef<HTMLAnchorElement>): JSX.Element => {
  const { icon, activeIcon, text, to = '', count, countMax, onClick } = props;
  const isActive = location.pathname === to;

  const handleClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (onClick) {
      onClick(e);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <NavLink
      exact
      to={to}
      ref={ref}
      onClick={handleClick}
      className={clsx({
        'flex items-center py-2 text-sm font-semibold space-x-4 rtl:space-x-reverse': true,
        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': !isActive,
        'text-gray-900 dark:text-white': isActive,
      })}
    >
      <span
        className={clsx({
          'relative rounded-lg inline-flex p-2.5': true,
          'bg-primary-50 dark:bg-slate-700': !isActive,
          'bg-primary-600': isActive,
        })}
      >
        <Icon
          src={(isActive && activeIcon) || icon}
          count={count}
          countMax={countMax}
          className={clsx('h-5 w-5', {
            'text-primary-700 dark:text-white': !isActive,
            'text-white': isActive,
          })}
        />
      </span>

      <Text weight='semibold' theme='inherit'>{text}</Text>
    </NavLink>
  );
});

export default SidebarNavigationLink;

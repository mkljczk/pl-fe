import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import DropdownMenu from 'pl-fe/components/dropdown-menu';

import HStack from '../hstack/hstack';
import Icon from '../icon/icon';
import Text from '../text/text';

import type { Menu } from 'pl-fe/components/dropdown-menu';

const messages = defineMessages({
  collapse: { id: 'accordion.collapse', defaultMessage: 'Collapse' },
  expand: { id: 'accordion.expand', defaultMessage: 'Expand' },
});

interface IAccordion {
  headline: React.ReactNode;
  children?: React.ReactNode;
  menu?: Menu;
  expanded?: boolean;
  onToggle?: (value: boolean) => void;
  action?: () => void;
  actionIcon?: string;
  actionLabel?: string;
}

/**
 * Accordion
 * An accordion is a vertically stacked group of collapsible sections.
 */
const Accordion: React.FC<IAccordion> = ({ headline, children, menu, expanded = false, onToggle = () => {}, action, actionIcon, actionLabel }) => {
  const intl = useIntl();

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggle(!expanded);
    e.preventDefault();
  };

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!action) return;

    action();
    e.preventDefault();
  };

  return (
    <div className='dark:bg-primary-800 rounded-lg bg-white text-gray-900 shadow dark:text-gray-100 dark:shadow-none'>
      <button
        type='button'
        onClick={handleToggle}
        title={intl.formatMessage(expanded ? messages.collapse : messages.expand)}
        aria-expanded={expanded}
        className='flex w-full items-center justify-between px-4 py-3 font-semibold'
      >
        <span>{headline}</span>

        <HStack alignItems='center' space={2}>
          {menu && (
            <DropdownMenu
              items={menu}
              src={require('@tabler/icons/outline/dots-vertical.svg')}
            />
          )}
          {action && actionIcon && (
            <button onClick={handleAction} title={actionLabel}>
              <Icon
                src={actionIcon}
                className='size-5 text-gray-700 dark:text-gray-600'
              />
            </button>
          )}
          <Icon
            src={expanded ? require('@tabler/icons/outline/chevron-up.svg') : require('@tabler/icons/outline/chevron-down.svg')}
            className='size-5 text-gray-700 dark:text-gray-600'
          />
        </HStack>
      </button>

      <div
        className={
          clsx({
            'p-4 rounded-b-lg border-t border-solid border-gray-100 dark:border-primary-900 black:border-black': true,
            'h-0 hidden': !expanded,
          })
        }
      >
        <Text>{children}</Text>
      </div>
    </div>
  );
};

export { Accordion as default };

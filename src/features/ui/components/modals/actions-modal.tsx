import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { spring } from 'react-motion';

import Icon from 'soapbox/components/icon';
import { HStack } from 'soapbox/components/ui';
import ReplyIndicator from 'soapbox/features/compose/components/reply-indicator';

import Motion from '../../util/optional-motion';

import type { Menu, MenuItem } from 'soapbox/components/dropdown-menu';
import type { Status as StatusEntity } from 'soapbox/types/entities';

interface IActionsModal {
  status: StatusEntity;
  actions: Menu;
  onClick: () => void;
  onClose: () => void;
}

const ActionsModal: React.FC<IActionsModal> = ({ status, actions, onClick, onClose }) => {
  const renderAction = (action: MenuItem | null, i: number) => {
    if (action === null) {
      return <li key={`sep-${i}`} className='m-2 block h-[1px] bg-gray-200 black:bg-gray-800 dark:bg-gray-600' />;
    }

    const { icon = null, text, meta = null, href = '#', destructive } = action;

    const Comp = href === '#' ? 'button' : 'a';
    const compProps = href === '#' ? { onClick: onClick } : { href: href, rel: 'noopener' };

    return (
      <li key={`${text}-${i}`}>
        <HStack
          {...compProps}
          space={2.5}
          data-index={i}
          className={clsx(
            'flex w-full items-center px-4 py-3 text-left text-gray-700 no-underline hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800 dark:focus:bg-primary-800',
            { 'text-danger-600 dark:text-danger-400': destructive },
          )}
          element={Comp}
        >
          {icon && <Icon className='first:h-5 first:w-5 first:min-w-[1.25rem]' title={text} src={icon} role='presentation' tabIndex={-1} />}
          <div>
            <div className={clsx({ 'font-medium': meta })}>{text}</div>
            <div>{meta}</div>
          </div>
        </HStack>
      </li>
    );
  };

  return (
    <Motion defaultStyle={{ top: 100 }} style={{ top: spring(0) }}>
      {({ top }) => (
        <div
          className='actions-modal pointer-events-auto relative z-[9999] m-auto flex max-h-[calc(100vh-3rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white text-gray-400 shadow-xl black:bg-black dark:bg-gray-900'
          style={{ top: `${top}%` }}
        >
          {status && (
            <ReplyIndicator className='max-h-[300px] overflow-y-auto rounded-b-none' status={status} hideActions />
          )}

          <ul className={clsx('my-2 max-h-[calc(100vh-147px)] shrink-0 overflow-y-auto', { 'max-h-[calc(80vh-75px)]': status })}>
            {actions && actions.map(renderAction)}

            <li className='m-2 block h-[1px] bg-gray-200 black:bg-gray-800 dark:bg-gray-600' />

            <li>
              <button className='w-full justify-center text-center' type='button' onClick={onClose}>
                <FormattedMessage id='lightbox.close' defaultMessage='Close' />
              </button>
            </li>
          </ul>
        </div>
      )}
    </Motion>
  );
};

export default ActionsModal;

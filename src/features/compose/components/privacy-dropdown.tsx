import clsx from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
import React, { useState, useRef, useEffect } from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';
import { spring } from 'react-motion';
// @ts-ignore
import Overlay from 'react-overlays/lib/Overlay';

import { changeComposeFederated, changeComposeVisibility } from 'soapbox/actions/compose';
import { closeModal, openModal } from 'soapbox/actions/modals';
import Icon from 'soapbox/components/icon';
import { Button, Toggle } from 'soapbox/components/ui';
import { useAppDispatch, useCompose, useFeatures, useInstance } from 'soapbox/hooks';
import { userTouching } from 'soapbox/is-mobile';
import { GOTOSOCIAL, parseVersion, PLEROMA } from 'soapbox/utils/features';

import Motion from '../../ui/util/optional-motion';

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  public_long: { id: 'privacy.public.long', defaultMessage: 'Post to public timelines' },
  unlisted_short: { id: 'privacy.unlisted.short', defaultMessage: 'Unlisted' },
  unlisted_long: { id: 'privacy.unlisted.long', defaultMessage: 'Do not post to public timelines' },
  private_short: { id: 'privacy.private.short', defaultMessage: 'Followers-only' },
  private_long: { id: 'privacy.private.long', defaultMessage: 'Post to followers only' },
  mutuals_only_short: { id: 'privacy.mutuals_only.short', defaultMessage: 'Mutuals-only' },
  mutuals_only_long: { id: 'privacy.mutuals_only.long', defaultMessage: 'Post to mutually followed users only' },
  direct_short: { id: 'privacy.direct.short', defaultMessage: 'Direct' },
  direct_long: { id: 'privacy.direct.long', defaultMessage: 'Post to mentioned users only' },
  local_short: { id: 'privacy.local.short', defaultMessage: 'Local-only' },
  local_long: { id: 'privacy.local.long', defaultMessage: 'Only visible on your instance' },

  change_privacy: { id: 'privacy.change', defaultMessage: 'Adjust post privacy' },
  local: { id: 'privacy.local', defaultMessage: '{privacy} (local-only)' },
});

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

interface Option {
  icon: string;
  value: string;
  text: string;
  meta: string;
}

interface IPrivacyDropdownMenu {
  style?: React.CSSProperties;
  items: any[];
  value: string;
  placement: string;
  onClose: () => void;
  onChange: (value: string | null) => void;
  unavailable?: boolean;
  showFederated?: boolean;
  federated?: boolean;
  onChangeFederated: () => void;
}

const PrivacyDropdownMenu: React.FC<IPrivacyDropdownMenu> = ({
  style, items, placement, value, onClose, onChange, showFederated, federated, onChangeFederated,
}) => {
  const node = useRef<HTMLDivElement>(null);
  const focusedItem = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState<boolean>(false);

  const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
    if (node.current && !node.current.contains(e.target as HTMLElement)) {
      onClose();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = e => {
    const index = [...e.currentTarget.parentElement!.children].indexOf(e.currentTarget);    let element: ChildNode | null | undefined = null;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'Enter':
        handleClick(e);
        break;
      case 'ArrowDown':
        element = node.current?.childNodes[index + 1] || node.current?.firstChild;
        break;
      case 'ArrowUp':
        element = node.current?.childNodes[index - 1] || node.current?.lastChild;
        break;
      case 'Tab':
        if (e.shiftKey) {
          element = node.current?.childNodes[index - 1] || node.current?.lastChild;
        } else {
          element = node.current?.childNodes[index + 1] || node.current?.firstChild;
        }
        break;
      case 'Home':
        element = node.current?.firstChild;
        break;
      case 'End':
        element = node.current?.lastChild;
        break;
    }

    if (element) {
      (element as HTMLElement).focus();
      const value = (element as HTMLElement).getAttribute('data-index');
      if (value !== 'local_switch') onChange(value);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleClick: React.EventHandler<any> = (e: MouseEvent | KeyboardEvent) => {
    const value = (e.currentTarget as HTMLElement)?.getAttribute('data-index');

    e.preventDefault();

    if (value === 'local_switch') onChangeFederated();
    else {
      onClose();
      onChange(value);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick, false);
    document.addEventListener('touchend', handleDocumentClick, listenerOptions);

    focusedItem.current?.focus({ preventScroll: true });
    setMounted(true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, false);
      document.removeEventListener('touchend', handleDocumentClick);
    };
  }, []);

  return (
    <Motion defaultStyle={{ opacity: 0, scaleX: 0.85, scaleY: 0.75 }} style={{ opacity: spring(1, { damping: 35, stiffness: 400 }), scaleX: spring(1, { damping: 35, stiffness: 400 }), scaleY: spring(1, { damping: 35, stiffness: 400 }) }}>
      {({ opacity, scaleX, scaleY }) => (
        // It should not be transformed when mounting because the resulting
        // size will be used to determine the coordinate of the menu by
        // react-overlays
        <div
          id='privacy-dropdown'
          className={clsx('absolute z-[1000] ml-10 overflow-hidden rounded-md bg-white text-sm shadow-lg black:border black:border-gray-800 black:bg-black dark:bg-gray-900', {
            'block shadow-md': open,
            'origin-[50%_100%]': placement === 'top',
            'origin-[50%_0]': placement === 'bottom',
          })}
          style={{ ...style, opacity: opacity, transform: mounted ? `scale(${scaleX}, ${scaleY})` : undefined }}
          role='listbox'
          ref={node}
        >
          {items.map(item => {
            const active = item.value === value;
            return (
              <div
                role='option'
                tabIndex={0}
                key={item.value}
                data-index={item.value}
                onKeyDown={handleKeyDown}
                onClick={handleClick}
                className={clsx(
                  'flex cursor-pointer items-center p-2.5 text-gray-700 hover:bg-gray-100 black:hover:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
                  { 'bg-gray-100 dark:bg-gray-800 black:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700': active },
                )}
                aria-selected={active}
                ref={active ? focusedItem : null}
              >
                <div className='mr-2.5 flex items-center justify-center rtl:ml-2.5 rtl:mr-0'>
                  <Icon src={item.icon} />
                </div>

                <div
                  className={clsx('flex-auto text-xs text-primary-600 dark:text-primary-400', {
                    'text-black dark:text-white': active,
                  })}
                >
                  <strong className='block text-sm font-medium text-black dark:text-white'>{item.text}</strong>
                  {item.meta}
                </div>
              </div>
            );
          })}
          {showFederated && (
            <div
              role='option'
              tabIndex={0}
              data-index='local_switch'
              onKeyDown={handleKeyDown}
              onClick={onChangeFederated}
              className='flex cursor-pointer items-center p-2.5 text-xs text-gray-700 hover:bg-gray-100 focus:bg-gray-100 black:hover:bg-gray-900 black:focus:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:bg-gray-800'
            >
              <div className='mr-2.5 flex items-center justify-center rtl:ml-2.5 rtl:mr-0'>
                <Icon src={require('@tabler/icons/outline/affiliate.svg')} />
              </div>

              <div
                className='flex-auto text-xs text-primary-600 dark:text-primary-400'
              >
                <strong className='block text-sm font-medium text-black focus:text-black dark:text-white dark:focus:text-primary-400'>
                  <FormattedMessage id='privacy.local.short' defaultMessage='Local-only' />
                </strong>
                <FormattedMessage id='privacy.local.long' defaultMessage='Only visible on your instance' />
              </div>

              <Toggle checked={!federated} onChange={onChangeFederated} />
            </div>
          )}
        </div>
      )}
    </Motion>
  );
};

interface IPrivacyDropdown {
  composeId: string;
}

const PrivacyDropdown: React.FC<IPrivacyDropdown> = ({
  composeId,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const node = useRef<HTMLDivElement>(null);
  const activeElement = useRef<HTMLElement | null>(null);
  const instance = useInstance();
  const features = useFeatures();

  const v = parseVersion(instance.version);

  const compose = useCompose(composeId);

  const value = compose.privacy;
  const unavailable = compose.id;

  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState('bottom');

  const options = [
    { icon: require('@tabler/icons/outline/world.svg'), value: 'public', text: intl.formatMessage(messages.public_short), meta: intl.formatMessage(messages.public_long) },
    { icon: require('@tabler/icons/outline/lock-open.svg'), value: 'unlisted', text: intl.formatMessage(messages.unlisted_short), meta: intl.formatMessage(messages.unlisted_long) },
    { icon: require('@tabler/icons/outline/lock.svg'), value: 'private', text: intl.formatMessage(messages.private_short), meta: intl.formatMessage(messages.private_long) },
    features.mutualsOnlyStatuses ? { icon: require('@tabler/icons/outline/users-group.svg'), value: 'mutuals_only', text: intl.formatMessage(messages.mutuals_only_short), meta: intl.formatMessage(messages.mutuals_only_long) } : undefined,
    { icon: require('@tabler/icons/outline/mail.svg'), value: 'direct', text: intl.formatMessage(messages.direct_short), meta: intl.formatMessage(messages.direct_long) },
    features.localOnlyStatuses && v.software === PLEROMA ? { icon: require('@tabler/icons/outline/affiliate.svg'), value: 'local', text: intl.formatMessage(messages.local_short), meta: intl.formatMessage(messages.local_long) } : undefined,
  ].filter((option): option is Option => !!option);

  const onChange = (value: string | null) => value && dispatch(changeComposeVisibility(composeId, value));

  const onChangeFederated = () => dispatch(changeComposeFederated(composeId));

  const onModalOpen = (props: Record<string, any>) => dispatch(openModal('ACTIONS', props));

  const onModalClose = () => dispatch(closeModal('ACTIONS'));

  const handleToggle: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (userTouching.matches) {
      if (open) {
        onModalClose();
      } else {
        onModalOpen({
          actions: options.map(option => ({ ...option, active: option.value === value })),
          onClick: handleModalActionClick,
        });
      }
    } else {
      const { top } = e.currentTarget.getBoundingClientRect();
      if (open) {
        activeElement.current?.focus();
      }
      setPlacement(top * 2 < innerHeight ? 'bottom' : 'top');
      setOpen(!open);
    }
    e.stopPropagation();
  };

  const handleModalActionClick: React.MouseEventHandler = (e) => {
    e.preventDefault();

    const { value } = options[e.currentTarget.getAttribute('data-index') as any];

    onModalClose();
    onChange(value);
  };

  const handleKeyDown: React.KeyboardEventHandler = e => {
    switch (e.key) {
      case 'Escape':
        handleClose();
        break;
    }
  };

  const handleMouseDown = () => {
    if (!open) {
      activeElement.current = document.activeElement as HTMLElement | null;
    }
  };

  const handleButtonKeyDown: React.KeyboardEventHandler = (e) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        handleMouseDown();
        break;
    }
  };

  const handleClose = () => {
    if (open) {
      activeElement.current?.focus();
    }
    setOpen(false);
  };

  if (unavailable) {
    return null;
  }

  const valueOption = options.find(item => item.value === value);

  return (
    <div onKeyDown={handleKeyDown} ref={node}>
      <div
        className={clsx({
          'rounded-t-md': open && placement === 'top',
          active: valueOption && options.indexOf(valueOption) === 0,
        })}
      >
        <Button
          theme='muted'
          size='xs'
          text={compose.federated ? valueOption?.text : intl.formatMessage(messages.local, {
            privacy: valueOption?.text,
          })}
          icon={valueOption?.icon}
          secondaryIcon={require('@tabler/icons/outline/chevron-down.svg')}
          title={intl.formatMessage(messages.change_privacy)}
          onClick={handleToggle}
          onMouseDown={handleMouseDown}
          onKeyDown={handleButtonKeyDown}
        />
      </div>

      <Overlay show={open} placement={placement} target={node.current}>
        <PrivacyDropdownMenu
          items={options}
          value={value}
          onClose={handleClose}
          onChange={onChange}
          placement={placement}
          showFederated={features.localOnlyStatuses && v.software === GOTOSOCIAL}
          federated={compose.federated}
          onChangeFederated={onChangeFederated}
        />
      </Overlay>
    </div>
  );
};

export { PrivacyDropdown as default };

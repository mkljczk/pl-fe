import clsx from 'clsx';
import React, { useRef } from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import { changeComposeFederated, changeComposeVisibility } from 'pl-fe/actions/compose';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import Icon from 'pl-fe/components/icon';
import { Button, Toggle } from 'pl-fe/components/ui';
import { useAppDispatch, useCompose, useFeatures } from 'pl-fe/hooks';

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

interface Option {
  icon: string;
  value: string;
  text: string;
  meta: string;
}

interface IPrivacyDropdownMenu {
  items: any[];
  value: string;
  onClose: () => void;
  onChange: (value: string | null) => void;
  unavailable?: boolean;
  showFederated?: boolean;
  federated?: boolean;
  onChangeFederated: () => void;
}

const PrivacyDropdownMenu: React.FC<IPrivacyDropdownMenu> = ({
  items, value, onClose, onChange, showFederated, federated, onChangeFederated,
}) => {
  const node = useRef<HTMLUListElement>(null);
  const focusedItem = useRef<HTMLLIElement>(null);

  const handleKeyDown: React.KeyboardEventHandler = e => {
    const index = [...e.currentTarget.parentElement!.children].indexOf(e.currentTarget);
    let element: ChildNode | null | undefined = null;

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

  return (
    <ul ref={node}>
      {items.map(item => {
        const active = item.value === value;
        return (
          <li
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
          </li>
        );
      })}
      {showFederated && (
        <li
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
        </li>
      )}

    </ul>
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
  const features = useFeatures();

  const compose = useCompose(composeId);

  const value = compose.privacy;
  const unavailable = compose.id;

  const options = [
    { icon: require('@tabler/icons/outline/world.svg'), value: 'public', text: intl.formatMessage(messages.public_short), meta: intl.formatMessage(messages.public_long) },
    { icon: require('@tabler/icons/outline/lock-open.svg'), value: 'unlisted', text: intl.formatMessage(messages.unlisted_short), meta: intl.formatMessage(messages.unlisted_long) },
    { icon: require('@tabler/icons/outline/lock.svg'), value: 'private', text: intl.formatMessage(messages.private_short), meta: intl.formatMessage(messages.private_long) },
    features.visibilityMutualsOnly ? { icon: require('@tabler/icons/outline/users-group.svg'), value: 'mutuals_only', text: intl.formatMessage(messages.mutuals_only_short), meta: intl.formatMessage(messages.mutuals_only_long) } : undefined,
    { icon: require('@tabler/icons/outline/mail.svg'), value: 'direct', text: intl.formatMessage(messages.direct_short), meta: intl.formatMessage(messages.direct_long) },
    features.visibilityLocalOnly ? { icon: require('@tabler/icons/outline/affiliate.svg'), value: 'local', text: intl.formatMessage(messages.local_short), meta: intl.formatMessage(messages.local_long) } : undefined,
  ].filter((option): option is Option => !!option);

  const onChange = (value: string | null) => value && dispatch(changeComposeVisibility(composeId, value));

  const onChangeFederated = () => dispatch(changeComposeFederated(composeId));

  if (unavailable) {
    return null;
  }

  const valueOption = options.find(item => item.value === value);

  return (
    <DropdownMenu
      component={({ handleClose }) => (
        <PrivacyDropdownMenu
          items={options}
          value={value}
          onClose={handleClose}
          onChange={onChange}
          showFederated={features.localOnlyStatuses}
          federated={compose.federated}
          onChangeFederated={onChangeFederated}
        />
      )}
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
      />
    </DropdownMenu>
  );
};

export { PrivacyDropdown as default };

import { offset, useFloating, flip, arrow, shift } from '@floating-ui/react';
import clsx from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
import fuzzysort from 'fuzzysort';
import { Map as ImmutableMap } from 'immutable';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { createSelector } from 'reselect';

import { changeComposeLanguage } from 'soapbox/actions/compose';
import { Button, Icon, Input, Portal } from 'soapbox/components/ui';
import { type Language, languages as languagesObject } from 'soapbox/features/preferences';
import { useAppDispatch, useAppSelector, useCompose } from 'soapbox/hooks';

const getFrequentlyUsedLanguages = createSelector([
  state => state.settings.get('frequentlyUsedLanguages', ImmutableMap()),
], (languageCounters: ImmutableMap<Language, number>) => (
  languageCounters.keySeq()
    .sort((a, b) => languageCounters.get(a, 0) - languageCounters.get(b, 0))
    .reverse()
    .toArray()
));

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

const languages = Object.entries(languagesObject) as Array<[Language, string]>;

const messages = defineMessages({
  languagePrompt: { id: 'compose.language_dropdown.prompt', defaultMessage: 'Select language' },
  search: { id: 'compose.language_dropdown.search', defaultMessage: 'Search language…' },
});

interface ILanguageDropdown {
  composeId: string;
}

const LanguageDropdown: React.FC<ILanguageDropdown> = ({ composeId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const frequentlyUsedLanguages = useAppSelector(getFrequentlyUsedLanguages);

  const node = useRef<HTMLDivElement>(null);
  const focusedItem = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');


  const { x, y, strategy, refs, middlewareData, placement } = useFloating<HTMLButtonElement>({
    placement: 'top',
    middleware: [
      offset(12),
      flip(),
      shift({
        padding: 8,
      }),
      arrow({
        element: arrowRef,
      }),
    ],
  });

  const language = useCompose(composeId).language;

  const handleClick: React.EventHandler<
    React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
  > = (event) => {
    event.stopPropagation();

    setIsOpen(!isOpen);
  };

  const handleKeyPress: React.EventHandler<React.KeyboardEvent<HTMLButtonElement>> = (event) => {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.stopPropagation();
        event.preventDefault();
        handleClick(event);
        break;
    }
  };

  const handleChange = (language: Language | null) => dispatch(changeComposeLanguage(composeId, language));

  const handleOptionKeyDown: React.KeyboardEventHandler = e => {
    const value = e.currentTarget.getAttribute('data-index');
    const index = results.findIndex(([key]) => key === value);
    let element: ChildNode | null | undefined = null;

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Enter':
        handleOptionClick(e);
        break;
      case 'ArrowDown':
        element = node.current?.childNodes[index + 1] || node.current?.firstChild;
        break;
      case 'ArrowUp':
        element = node.current?.childNodes[index - 1] || node.current?.lastChild;
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
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleOptionClick: React.EventHandler<any> = (e: MouseEvent | KeyboardEvent) => {
    const value = (e.currentTarget as HTMLElement)?.getAttribute('data-index') as Language;

    e.preventDefault();

    setIsOpen(false);
    handleChange(value);
  };

  const handleClear: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setSearchValue('');
  };

  const search = () => {
    if (searchValue === '') {
      return [...languages].sort((a, b) => {
        // Push current selection to the top of the list

        if (a[0] === language) {
          return -1;
        } else if (b[0] === language) {
          return 1;
        } else {
          // Sort according to frequently used languages

          const indexOfA = frequentlyUsedLanguages.indexOf(a[0]);
          const indexOfB = frequentlyUsedLanguages.indexOf(b[0]);

          return ((indexOfA > -1 ? indexOfA : Infinity) - (indexOfB > -1 ? indexOfB : Infinity));
        }
      });
    }

    return fuzzysort.go(searchValue, languages, {
      keys: ['0', '1'],
      limit: 5,
      threshold: -10000,
    }).map(result => result.obj);
  };

  const handleDocumentClick = (event: Event) => {
    if (refs.floating.current && !refs.floating.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!refs.floating.current) return;

    const items = Array.from(refs.floating.current.getElementsByTagName('a'));
    const index = items.indexOf(document.activeElement as any);

    let element = null;

    switch (e.key) {
      case 'ArrowDown':
        element = items[index + 1] || items[0];
        break;
      case 'ArrowUp':
        element = items[index - 1] || items[items.length - 1];
        break;
      case 'Tab':
        if (e.shiftKey) {
          element = items[index - 1] || items[items.length - 1];
        } else {
          element = items[index + 1] || items[0];
        }
        break;
      case 'Home':
        element = items[0];
        break;
      case 'End':
        element = items[items.length - 1];
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }

    if (element) {
      element.focus();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const arrowProps: React.CSSProperties = useMemo(() => {
    if (middlewareData.arrow) {
      const { x, y } = middlewareData.arrow;

      const staticPlacement = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      return {
        left: x !== null ? `${x}px` : '',
        top: y !== null ? `${y}px` : '',
        // Ensure the static side gets unset when
        // flipping to other placements' axes.
        right: '',
        bottom: '',
        [staticPlacement as string]: `${(-(arrowRef.current?.offsetWidth || 0)) / 2}px`,
        transform: 'rotate(45deg)',
      };
    }

    return {};
  }, [middlewareData.arrow, placement]);

  useEffect(() => {
    if (isOpen) {
      if (refs.floating.current) {
        (refs.floating.current?.querySelector('li a[role=\'button\']') as HTMLAnchorElement)?.focus();
      }

      document.addEventListener('click', handleDocumentClick, false);
      document.addEventListener('keydown', handleKeyDown, false);
      document.addEventListener('touchend', handleDocumentClick, listenerOptions);

      return () => {
        document.removeEventListener('click', handleDocumentClick);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('touchend', handleDocumentClick);
      };
    }
  }, [isOpen, refs.floating.current]);

  const isSearching = searchValue !== '';
  const results = search();

  return (
    <>
      <Button
        theme='muted'
        size='xs'
        text={language ? languagesObject[language] : intl.formatMessage(messages.languagePrompt)}
        icon={require('@tabler/icons/outline/language.svg')}
        secondaryIcon={require('@tabler/icons/outline/chevron-down.svg')}
        title={intl.formatMessage(messages.languagePrompt)}
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        ref={refs.setReference}
      />
      {isOpen ? (
        <Portal>
          <div
            id='language-dropdown'
            ref={refs.setFloating}
            className={clsx('z-[1001] flex flex-col rounded-md bg-white text-sm shadow-lg transition-opacity duration-100 focus:outline-none black:border black:border-gray-800 black:bg-black dark:bg-gray-900 dark:ring-2 dark:ring-primary-700', {
              'opacity-0 pointer-events-none': !isOpen,
            })}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            role='listbox'
          >
            <label className='relative grow p-2'>
              <span style={{ display: 'none' }}>{intl.formatMessage(messages.search)}</span>

              <Input
                className='w-64'
                type='text'
                value={searchValue}
                onChange={({ target }) => setSearchValue(target.value)}
                outerClassName='mt-0'
                placeholder={intl.formatMessage(messages.search)}
              />
              <div role='button' tabIndex={0} className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-5 rtl:left-0 rtl:right-auto' onClick={handleClear}>
                <Icon
                  className='h-5 w-5 text-gray-600'
                  src={isSearching ? require('@tabler/icons/outline/backspace.svg') : require('@tabler/icons/outline/search.svg')}
                  aria-label={intl.formatMessage(messages.search)}
                />
              </div>
            </label>
            <div className='h-96 w-full overflow-scroll' ref={node} tabIndex={-1}>
              {results.map(([code, name]) => {
                const active = code === language;

                return (
                  <div
                    role='option'
                    tabIndex={0}
                    key={code}
                    data-index={code}
                    onKeyDown={handleOptionKeyDown}
                    onClick={handleOptionClick}
                    className={clsx(
                      'flex cursor-pointer p-2.5 text-sm text-gray-700 hover:bg-gray-100 black:hover:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
                      { 'bg-gray-100 dark:bg-gray-800 black:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700': active },
                    )}
                    aria-selected={active}
                    ref={active ? focusedItem : null}
                  >
                    <div
                      className={clsx('flex-auto text-primary-600 dark:text-primary-400', {
                        'text-black dark:text-white': active,
                      })}
                    >
                      {name}
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              ref={arrowRef}
              style={arrowProps}
              className='pointer-events-none absolute z-[-1] h-3 w-3 bg-white black:bg-black dark:bg-gray-900'
            />
          </div>
        </Portal>
      ) : null}
    </>
  );

};

export { LanguageDropdown as default };

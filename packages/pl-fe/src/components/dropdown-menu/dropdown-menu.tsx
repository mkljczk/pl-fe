import { offset, Placement, useFloating, flip, arrow, shift } from '@floating-ui/react';
import clsx from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import ReactSwipeableViews from 'react-swipeable-views';

import { closeDropdownMenu as closeDropdownMenuRedux, openDropdownMenu } from 'pl-fe/actions/dropdown-menu';
import { useAppDispatch } from 'pl-fe/hooks';
import { userTouching } from 'pl-fe/is-mobile';

import { HStack, IconButton, Portal } from '../ui';

import DropdownMenuItem, { MenuItem } from './dropdown-menu-item';

type Menu = Array<MenuItem | null>;

interface IDropdownMenu {
  children?: React.ReactElement;
  disabled?: boolean;
  items?: Menu;
  component?: React.FC<{ handleClose: () => any }>;
  onClose?: () => void;
  onOpen?: () => void;
  onShiftClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>;
  placement?: Placement;
  src?: string;
  title?: string;
}

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

const DropdownMenu = (props: IDropdownMenu) => {
  const {
    children,
    disabled,
    items,
    component: Component,
    onClose,
    onOpen,
    onShiftClick,
    placement: initialPlacement = 'top',
    src = require('@tabler/icons/outline/dots.svg'),
    title = 'Menu',
  } = props;

  const dispatch = useAppDispatch();
  const history = useHistory();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDisplayed, setIsDisplayed] = useState<boolean>(false);
  const [tab, setTab] = useState<number>();

  const touching = userTouching.matches;

  const arrowRef = useRef<HTMLDivElement>(null);
  const dropdownHistoryKey = useRef<number>();
  const unlistenHistory = useRef<ReturnType<typeof history.listen>>();

  const { x, y, strategy, refs, middlewareData, placement } = useFloating<HTMLButtonElement>({
    placement: initialPlacement,
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

  const handleClick: React.EventHandler<
    React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
  > = (event) => {
    event.stopPropagation();

    if (onShiftClick && event.shiftKey) {
      event.preventDefault();

      onShiftClick(event);
      return;
    }

    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  const handleOpen = () => {
    dispatch(openDropdownMenu());
    setIsOpen(true);
    setTab(undefined);

    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = (goBack: any = true) => {
    (refs.reference.current as HTMLButtonElement)?.focus();

    if (unlistenHistory.current) {
      unlistenHistory.current();
      unlistenHistory.current = undefined;
    }
    const { state } = history.location;
    if (goBack && state && (state as any).plFeDropdownKey && (state as any).plFeDropdownKey === dropdownHistoryKey.current) {
      history.goBack();
      (history.location.state as any).plFeDropdownKey = undefined;
    }

    closeDropdownMenu();
    setIsOpen(false);

    if (onClose) {
      onClose();
    }
  };

  const closeDropdownMenu = () => {
    dispatch((dispatch, getState) => {
      const isOpenRedux = getState().dropdown_menu.isOpen;

      if (isOpenRedux) {
        dispatch(closeDropdownMenuRedux());
      }
    });
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

  const handleDocumentClick = useMemo(() => (event: Event) => {
    if (refs.floating.current && !refs.floating.current.contains(event.target as Node)) {
      handleClose();
      event.stopPropagation();
    }
  }, [refs.floating.current]);

  const handleExitSubmenu: React.EventHandler<any> = (event) => {
    event.stopPropagation();
    setTab(undefined);
  };

  const handleKeyDown = useMemo(() => (e: KeyboardEvent) => {
    if (!refs.floating.current) return;

    const items = Array.from(refs.floating.current.querySelectorAll('a, button'));
    const index = items.indexOf(document.activeElement as any);

    let element = null;

    switch (e.key) {
      case 'ArrowLeft':
        if (tab !== undefined) setTab(undefined);
        break;
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
        handleClose();
        break;
    }

    if (element) {
      (element as HTMLAnchorElement).focus();
      e.preventDefault();
      e.stopPropagation();
    }
  }, [refs.floating.current]);

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

  useEffect(() => () => {
    closeDropdownMenu();
  }, []);

  useEffect(() => {
    if (isOpen) {
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

  useEffect(() => {
    setTimeout(() => setIsDisplayed(isOpen), isOpen ? 0 : 150);

    if (isOpen && touching) {
      const { pathname, state } = history.location;

      dropdownHistoryKey.current = Date.now();

      history.push(pathname, { ...(state as any), plFeDropdownKey: dropdownHistoryKey.current });

      unlistenHistory.current = history.listen(({ state }, action) => {
        if (!(state as any)?.plFeDropdownKey) {
          handleClose(false);
        } else if (action === 'POP') {
          handleClose(false);
        }
      });
    }
  }, [isOpen]);

  if (items?.length === 0 && !Component) {
    return null;
  }

  const autoFocus = items && !items.some((item) => item?.active);

  const getClassName = () => {
    const className = clsx('z-[1001] bg-white py-1 shadow-lg ease-in-out focus:outline-none black:bg-black no-reduce-motion:transition-all dark:bg-gray-900 dark:ring-2 dark:ring-primary-700',
      touching ? clsx({
        'overflow-auto fixed left-0 right-0 mx-auto w-[calc(100vw-2rem)] max-w-lg max-h-[calc(100dvh-1rem)] rounded-t-xl duration-200': true,
        'bottom-0 opacity-100': isDisplayed && isOpen,
        '-bottom-32 opacity-0': !(isDisplayed && isOpen),
      }) : clsx({
        'rounded-md min-w-56 max-w-sm duration-100': true,
        'scale-0': !(isDisplayed && isOpen),
        'scale-100': isDisplayed && isOpen,
        'origin-bottom': placement === 'top',
        'origin-left': placement === 'right',
        'origin-top': placement === 'bottom',
        'origin-right': placement === 'left',
        'origin-bottom-left': placement === 'top-start',
        'origin-bottom-right': placement === 'top-end',
        'origin-top-left': placement === 'bottom-start',
        'origin-top-right': placement === 'bottom-end',
      }));

    return className;
  };

  const renderItems = (items: Menu | undefined) => (
    <ul>
      {items?.map((item, idx) => (
        <DropdownMenuItem
          key={idx}
          item={item}
          index={idx}
          onClick={handleClose}
          autoFocus={autoFocus}
          onSetTab={setTab}
        />
      ))}
    </ul>
  );

  return (
    <>
      {children ? (
        React.cloneElement(children, {
          disabled,
          onClick: handleClick,
          onKeyPress: handleKeyPress,
          ref: refs.setReference,
        })
      ) : (
        <IconButton
          disabled={disabled}
          className={clsx({
            'text-gray-600 hover:text-gray-700 dark:hover:text-gray-500': true,
            'text-gray-700 dark:text-gray-500': isOpen,
          })}
          title={title}
          src={src}
          onClick={handleClick}
          onKeyPress={handleKeyPress}
          ref={refs.setReference}
        />
      )}

      {isOpen || isDisplayed ? (
        <Portal>
          {touching && (
            <div
              className={clsx('fixed inset-0 z-[1000] bg-gray-500 black:bg-gray-900 no-reduce-motion:transition-opacity dark:bg-gray-700', {
                'opacity-0': !(isOpen && isDisplayed),
                'opacity-60': (isOpen && isDisplayed),
              })}
              role='button'
            />
          )}
          <div
            data-testid='dropdown-menu'
            className={getClassName()}
            ref={refs.setFloating}
            style={touching ? undefined : {
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
          >
            {items?.some(item => item?.items?.length) ? (
              <ReactSwipeableViews animateHeight index={tab === undefined ? 0 : 1}>
                <div className={clsx({ 'w-full': touching })}>
                  {Component && <Component handleClose={handleClose} />}
                  {(items?.length || touching) && renderItems(items)}
                </div>
                <div className={clsx({ 'w-full': touching, 'fit-content': !touching })}>
                  {tab !== undefined && (
                    <>
                      <HStack className='mx-2 my-1 text-gray-700 dark:text-gray-300' space={3} alignItems='center'>
                        <IconButton
                          theme='transparent'
                          src={require('@tabler/icons/outline/arrow-left.svg')}
                          iconClassName='h-5 w-5'
                          onClick={handleExitSubmenu}
                        />
                        {items![tab]?.text}
                      </HStack>
                      {renderItems(items![tab]?.items)}
                    </>
                  )}
                </div>
              </ReactSwipeableViews>
            ) : (
              <>
                {Component && <Component handleClose={handleClose} />}
                {(items?.length || touching) && renderItems(items)}
              </>
            )}

            {touching && (
              <div className='p-2 px-3'>
                <button
                  className='flex w-full appearance-none place-content-center items-center justify-center rounded-full border border-gray-700 bg-transparent p-2 text-sm font-medium text-gray-700 transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:border-gray-500 dark:text-gray-500'
                  onClick={handleClose}
                >
                  <FormattedMessage id='lightbox.close' defaultMessage='Close' />
                </button>
              </div>
            )}

            {/* Arrow */}
            {!touching && (
              <div
                ref={arrowRef}
                style={arrowProps}
                className='pointer-events-none absolute z-[-1] h-3 w-3 bg-white black:bg-black dark:bg-gray-900'
              />
            )}
          </div>
        </Portal>
      ) : null}
    </>
  );
};

export { type Menu, DropdownMenu as default };

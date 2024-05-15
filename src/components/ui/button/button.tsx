import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '../icon/icon';

import { useButtonStyles } from './useButtonStyles';

import type { ButtonSizes, ButtonThemes } from './useButtonStyles';

interface IButton extends Pick<
  React.ComponentProps<'button'>,
  'children' | 'className' | 'disabled' | 'onClick' | 'onMouseDown' | 'onKeyDown' | 'title' | 'type'
> {
  /** Whether this button expands the width of its container. */
  block?: boolean;
  /** URL to an SVG icon to render inside the button. */
  icon?: string;
  /** URL to an SVG icon to render inside the button next to the text. */
  secondaryIcon?: string;
  /** A predefined button size. */
  size?: ButtonSizes;
  /** Text inside the button. Takes precedence over `children`. */
  text?: React.ReactNode;
  /** Makes the button into a navlink, if provided. */
  to?: string;
  /** Styles the button visually with a predefined theme. */
  theme?: ButtonThemes;
}

/** Customizable button element with various themes. */
const Button = React.forwardRef<HTMLButtonElement, IButton>(({
  block = false,
  children,
  disabled = false,
  icon,
  secondaryIcon,
  onClick,
  size = 'md',
  text,
  theme = 'secondary',
  to,
  type = 'button',
  className,
  ...props
}, ref): JSX.Element => {
  const body = text || children;

  const themeClass = useButtonStyles({
    theme,
    block,
    disabled,
    size,
  });

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback((event) => {
    if (onClick && !disabled) {
      onClick(event);
    }
  }, [onClick, disabled]);

  const renderButton = () => (
    <button
      {...props}
      className={clsx('rtl:space-x-reverse', themeClass, className)}
      disabled={disabled}
      onClick={handleClick}
      ref={ref}
      type={type}
      data-testid='button'
    >
      {icon ? <Icon src={icon} className='h-4 w-4' /> : null}

      {body && (
        <span>{body}</span>
      )}

      {secondaryIcon ? <Icon src={secondaryIcon} className='h-4 w-4' /> : null}
    </button>
  );

  if (to) {
    return (
      <Link to={to} tabIndex={-1} className='inline-flex'>
        {renderButton()}
      </Link>
    );
  }

  return renderButton();
});

export {
  Button as default,
  Button,
};

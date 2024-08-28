import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useRef } from 'react';

import { fetchAccount } from 'pl-fe/actions/accounts';
import { openProfileHoverCard, closeProfileHoverCard } from 'pl-fe/actions/profile-hover-card';
import { useAppDispatch } from 'pl-fe/hooks';
import { isMobile } from 'pl-fe/is-mobile';

const showProfileHoverCard = debounce((dispatch, ref, accountId) => {
  dispatch(openProfileHoverCard(ref, accountId));
}, 600);

interface IHoverRefWrapper {
  accountId: string;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Makes a profile hover card appear when the wrapped element is hovered. */
const HoverRefWrapper: React.FC<IHoverRefWrapper> = ({ accountId, children, inline = false, className }) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const Elem: keyof JSX.IntrinsicElements = inline ? 'span' : 'div';

  const handleMouseEnter = () => {
    if (!isMobile(window.innerWidth)) {
      dispatch(fetchAccount(accountId));
      showProfileHoverCard(dispatch, ref, accountId);
    }
  };

  const handleMouseLeave = () => {
    showProfileHoverCard.cancel();
    setTimeout(() => dispatch(closeProfileHoverCard()), 300);
  };

  const handleClick = () => {
    showProfileHoverCard.cancel();
    dispatch(closeProfileHoverCard(true));
  };

  return (
    <Elem
      ref={ref}
      className={clsx('hover-ref-wrapper', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
    </Elem>
  );
};

export { HoverRefWrapper as default, showProfileHoverCard };

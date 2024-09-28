import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useRef } from 'react';

import { fetchAccount } from 'pl-fe/actions/accounts';
import { useAppDispatch } from 'pl-fe/hooks';
import { isMobile } from 'pl-fe/is-mobile';
import { useAccountHoverCardStore } from 'pl-fe/stores';

const showProfileHoverCard = debounce((openAccountHoverCard, ref, accountId) => {
  openAccountHoverCard(ref, accountId);
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

  const { openAccountHoverCard, closeAccountHoverCard } = useAccountHoverCardStore();

  const ref = useRef<HTMLDivElement>(null);
  const Elem: keyof JSX.IntrinsicElements = inline ? 'span' : 'div';

  const handleMouseEnter = () => {
    if (!isMobile(window.innerWidth)) {
      dispatch(fetchAccount(accountId));
      showProfileHoverCard(openAccountHoverCard, ref, accountId);
    }
  };

  const handleMouseLeave = () => {
    showProfileHoverCard.cancel();
    setTimeout(() => closeAccountHoverCard(), 300);
  };

  const handleClick = () => {
    showProfileHoverCard.cancel();
    closeAccountHoverCard(true);
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

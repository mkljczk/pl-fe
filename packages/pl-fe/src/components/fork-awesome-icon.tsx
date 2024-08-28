/**
 * ForkAwesomeIcon: renders a ForkAwesome icon.
 * Full list: https://forkaweso.me/Fork-Awesome/icons/
 * @module soapbox/components/fork_awesome_icon
 * @see soapbox/components/icon
 */

import clsx from 'clsx';
import React from 'react';

interface IForkAwesomeIcon extends React.HTMLAttributes<HTMLLIElement> {
  id: string;
  className?: string;
  fixedWidth?: boolean;
}

const ForkAwesomeIcon: React.FC<IForkAwesomeIcon> = ({ id, className, fixedWidth, ...rest }) => {
  // Use the Fork Awesome retweet icon, but change its alt
  // tag. There is a common adblocker rule which hides elements with
  // alt='retweet' unless the domain is twitter.com. This should
  // change what screenreaders call it as well.
  // const alt = (id === 'retweet') ? 'repost' : id;

  return (
    <i
      role='img'
      // alt={alt}
      className={clsx('fa', `fa-${id}`, className, { 'fa-fw': fixedWidth })}
      {...rest}
    />
  );
};

export { type IForkAwesomeIcon, ForkAwesomeIcon as default };

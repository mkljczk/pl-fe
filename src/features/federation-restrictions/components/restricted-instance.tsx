import clsx from 'clsx';
import React, { useState } from 'react';

import Icon from 'soapbox/components/icon';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetRemoteInstance } from 'soapbox/selectors';

import InstanceRestrictions from './instance-restrictions';

const getRemoteInstance = makeGetRemoteInstance();

interface IRestrictedInstance {
  host: string;
}

const RestrictedInstance: React.FC<IRestrictedInstance> = ({ host }) => {
  const remoteInstance: any = useAppSelector((state) => getRemoteInstance(state, host));

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded: React.MouseEventHandler<HTMLAnchorElement> = e => {
    setExpanded((value) => !value);
    e.preventDefault();
  };

  return (
    <div>
      <a href='#' className='flex items-center gap-1 py-2.5 no-underline' onClick={toggleExpanded}>
        <Icon src={expanded ? require('@tabler/icons/outline/caret-down.svg') : require('@tabler/icons/outline/caret-right.svg')} />
        <div className={clsx({ 'line-through': remoteInstance.federation.reject })}>
          {remoteInstance.host}
        </div>
      </a>
      <div
        className={clsx({
          'h-0 overflow-hidden': !expanded,
          'h-auto': expanded,
        })}
      >
        <InstanceRestrictions remoteInstance={remoteInstance} />
      </div>
    </div>
  );
};

export { RestrictedInstance as default };

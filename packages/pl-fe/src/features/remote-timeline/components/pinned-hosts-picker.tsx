import React from 'react';

import { Button, HStack } from 'pl-fe/components/ui';
import { useSettings } from 'pl-fe/hooks';

interface IPinnedHostsPicker {
  /** The active host among pinned hosts. */
  host?: string;
}

const PinnedHostsPicker: React.FC<IPinnedHostsPicker> = ({ host: activeHost }) => {
  const settings = useSettings();
  const pinnedHosts = settings.remote_timeline.pinnedHosts;

  if (!pinnedHosts.length) return null;

  return (
    <HStack className='black:mx-2 mb-4' space={2}>
      {pinnedHosts.map((host) => (
        <Button
          key={host}
          to={`/timeline/${host}`}
          size='sm'
          theme={host === activeHost ? 'accent' : 'secondary'}
        >
          {host}
        </Button>
      ))}
    </HStack>
  );
};

export { PinnedHostsPicker as default };

import { useLoggedIn } from 'soapbox/hooks/useLoggedIn';

import { useTimelineStream } from './useTimelineStream';

const useDirectStream = () => {
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream(
    'direct',
    'direct',
    null,
    null,
    { enabled: isLoggedIn },
  );
};

export { useDirectStream };
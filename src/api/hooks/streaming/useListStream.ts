import { useLoggedIn } from 'soapbox/hooks';

import { useTimelineStream } from './useTimelineStream';

const useListStream = (listId: string) => {
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream(
    `list:${listId}`,
    `list&list=${listId}`,
    null,
    null,
    { enabled: isLoggedIn },
  );
};

export { useListStream };
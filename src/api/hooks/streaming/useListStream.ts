import { useLoggedIn } from 'soapbox/hooks';

import { useTimelineStream } from './useTimelineStream';

const useListStream = (listId: string) => {
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream('list', { list: listId }, isLoggedIn);
};

export { useListStream };

import { useLoggedIn } from 'pl-fe/hooks/useLoggedIn';

import { useTimelineStream } from './useTimelineStream';

const useListStream = (listId: string) => {
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream('list', { list: listId }, isLoggedIn);
};

export { useListStream };

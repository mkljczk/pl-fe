import { useTimelineStream } from './useTimelineStream';

const useGroupStream = (groupId: string) => useTimelineStream('group', { group: groupId } as any);

export { useGroupStream };
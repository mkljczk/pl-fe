import { useTimelineStream } from './useTimelineStream';

const useGroupStream = (groupId: string) => useTimelineStream(`group:${groupId}`, `group&group=${groupId}`);

export { useGroupStream };
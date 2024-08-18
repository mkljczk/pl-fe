import { useTimelineStream } from './useTimelineStream';

const useHashtagStream = (tag: string) => useTimelineStream('hashtag', { tag });

export { useHashtagStream };
import { useTimelineStream } from './useTimelineStream';

const useHashtagStream = (tag: string) => useTimelineStream(`hashtag:${tag}`, `hashtag&tag=${tag}`);

export { useHashtagStream };
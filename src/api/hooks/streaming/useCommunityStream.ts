import { useTimelineStream } from './useTimelineStream';

interface UseCommunityStreamOpts {
  onlyMedia?: boolean;
  enabled?: boolean;
}

const useCommunityStream = ({ onlyMedia, enabled }: UseCommunityStreamOpts = {}) =>
  useTimelineStream(
    `community${onlyMedia ? ':media' : ''}`,
    `public:local${onlyMedia ? ':media' : ''}`,
    undefined,
    undefined,
    { enabled },
  );

export { useCommunityStream };
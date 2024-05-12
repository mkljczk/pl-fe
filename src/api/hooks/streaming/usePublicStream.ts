import { useTimelineStream } from './useTimelineStream';

interface UsePublicStreamOpts {
  onlyMedia?: boolean;
}

const usePublicStream = ({ onlyMedia }: UsePublicStreamOpts = {}) =>
  useTimelineStream(`public${onlyMedia ? ':media' : ''}`, `public${onlyMedia ? ':media' : ''}`);

export { usePublicStream };
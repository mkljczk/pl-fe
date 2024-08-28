import { useTimelineStream } from './useTimelineStream';

interface UseRemoteStreamOpts {
  instance: string;
  onlyMedia?: boolean;
}

const useRemoteStream = ({ instance, onlyMedia }: UseRemoteStreamOpts) =>
  useTimelineStream(`public:remote${onlyMedia ? ':media' : ''}`, { instance } as any);

export { useRemoteStream };

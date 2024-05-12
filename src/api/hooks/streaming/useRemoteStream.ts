import { useTimelineStream } from './useTimelineStream';

interface UseRemoteStreamOpts {
  instance: string;
  onlyMedia?: boolean;
}

const useRemoteStream = ({ instance, onlyMedia }: UseRemoteStreamOpts) =>
  useTimelineStream(
    `remote${onlyMedia ? ':media' : ''}:${instance}`,
    `public:remote${onlyMedia ? ':media' : ''}&instance=${instance}`,
  );

export { useRemoteStream };
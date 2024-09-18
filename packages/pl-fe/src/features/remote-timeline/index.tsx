import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchPublicTimeline } from 'pl-fe/actions/timelines';
import { useRemoteStream } from 'pl-fe/api/hooks';
import IconButton from 'pl-fe/components/icon-button';
import { Column, HStack, Text } from 'pl-fe/components/ui';
import { useAppDispatch, useSettings, useTheme } from 'pl-fe/hooks';
import { useIsMobile } from 'pl-fe/hooks/useIsMobile';

import Timeline from '../ui/components/timeline';

import PinnedHostsPicker from './components/pinned-hosts-picker';

interface IRemoteTimeline {
  params?: {
    instance?: string;
  };
}

/** View statuses from a remote instance. */
const RemoteTimeline: React.FC<IRemoteTimeline> = ({ params }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const instance = params?.instance as string;
  const settings = useSettings();

  const timelineId = 'remote';
  const onlyMedia = settings.remote.other.onlyMedia;

  const pinned = settings.remote_timeline.pinnedHosts.includes(instance);
  const isMobile = useIsMobile();

  const handleCloseClick: React.MouseEventHandler = () => {
    history.push('/timeline/fediverse');
  };

  const handleLoadMore = () => {
    dispatch(fetchPublicTimeline({ onlyMedia, instance }, true));
  };

  useRemoteStream({ instance, onlyMedia });

  useEffect(() => {
    dispatch(fetchPublicTimeline({ onlyMedia, instance }));
  }, [onlyMedia]);

  return (
    <Column label={instance} transparent={!isMobile}>
      {instance && <PinnedHostsPicker host={instance} />}

      {!pinned && (
        <HStack className='mb-4 px-2' space={2}>
          <IconButton
            iconClassName='h-5 w-5'
            src={require('@tabler/icons/outline/x.svg')}
            onClick={handleCloseClick}
          />
          <Text>
            <FormattedMessage
              id='remote_timeline.filter_message'
              defaultMessage='You are viewing the timeline of {instance}.'
              values={{ instance }}
            />
          </Text>
        </HStack>
      )}

      <Timeline
        className='black:p-0 black:sm:p-4'
        loadMoreClassName='black:sm:mx-4'
        scrollKey={`${timelineId}_${instance}_timeline`}
        timelineId={`${timelineId}${onlyMedia ? ':media' : ''}:${instance}`}
        onLoadMore={handleLoadMore}
        emptyMessage={
          <FormattedMessage
            id='empty_column.remote'
            defaultMessage='There is nothing here! Manually follow users from {instance} to fill it up.'
            values={{ instance }}
          />
        }
        divideType={theme === 'black' || isMobile ? 'border' : 'space'}
      />
    </Column>
  );
};

export { RemoteTimeline as default };

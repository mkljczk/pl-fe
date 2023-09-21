import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { expandCommunityTimeline } from 'soapbox/actions/timelines';
import { useCommunityStream } from 'soapbox/api/hooks';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Column } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch, useSettings } from 'soapbox/hooks';

import Sonar from '../public-layout/components/sonar';
import Timeline from '../ui/components/timeline';

import { SiteBanner } from './components/site-banner';

const LandingTimeline = () => {
  const dispatch = useAppDispatch();

  const settings = useSettings();
  const onlyMedia = !!settings.getIn(['community', 'other', 'onlyMedia'], false);
  const next = useAppSelector(state => state.timelines.get('community')?.next);

  const timelineId = 'community';

  const handleLoadMore = (maxId: string) => {
    dispatch(expandCommunityTimeline({ url: next, maxId, onlyMedia }));
  };

  const handleRefresh = () => {
    return dispatch(expandCommunityTimeline({ onlyMedia }));
  };

  useCommunityStream({ onlyMedia });

  useEffect(() => {
    dispatch(expandCommunityTimeline({ onlyMedia }));
  }, [onlyMedia]);

  return (
    <Column className='-mt-3 sm:mt-0' transparent withHeader={false}>
      <div className='my-20 px-4'>
        <div className='absolute -z-10 -mt-64'>
          <Sonar />
        </div>
        <div className='-mt-8'>
          <SiteBanner />
        </div>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
          divideType='space'
        />
      </PullToRefresh>
    </Column>
  );
};

export default LandingTimeline;

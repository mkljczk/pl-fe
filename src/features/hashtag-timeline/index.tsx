import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchHashtag, followHashtag, unfollowHashtag } from 'soapbox/actions/tags';
import { expandHashtagTimeline, clearTimeline } from 'soapbox/actions/timelines';
import { useHashtagStream } from 'soapbox/api/hooks';
import List, { ListItem } from 'soapbox/components/list';
import { Column, Toggle } from 'soapbox/components/ui';
import Timeline from 'soapbox/features/ui/components/timeline';
import { useAppDispatch, useAppSelector, useFeatures, useLoggedIn, useTheme } from 'soapbox/hooks';
import { useIsMobile } from 'soapbox/hooks/useIsMobile';

interface IHashtagTimeline {
  params?: {
    id?: string;
  };
}

const HashtagTimeline: React.FC<IHashtagTimeline> = ({ params }) => {
  const id = params?.id || '';

  const features = useFeatures();
  const dispatch = useAppDispatch();
  const tag = useAppSelector((state) => state.tags.get(id));
  const next = useAppSelector(state => state.timelines.get(`hashtag:${id}`)?.next);
  const { isLoggedIn } = useLoggedIn();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const handleLoadMore = (maxId: string) => {
    dispatch(expandHashtagTimeline(id, { url: next, maxId }));
  };

  const handleFollow = () => {
    if (tag?.following) {
      dispatch(unfollowHashtag(id));
    } else {
      dispatch(followHashtag(id));
    }
  };

  useHashtagStream(id);

  useEffect(() => {
    dispatch(expandHashtagTimeline(id));
    dispatch(fetchHashtag(id));
  }, [id]);

  useEffect(() => {
    dispatch(clearTimeline(`hashtag:${id}`));
    dispatch(expandHashtagTimeline(id));
  }, [id]);

  return (
    <Column label={`#${id}`} transparent={!isMobile}>
      {features.followHashtags && isLoggedIn && (
        <List>
          <ListItem
            label={<FormattedMessage id='hashtag.follow' defaultMessage='Follow hashtag' />}
          >
            <Toggle
              checked={tag?.following}
              onChange={handleFollow}
            />
          </ListItem>
        </List>
      )}
      <Timeline
        className='black:p-4 black:sm:p-5'
        scrollKey='hashtag_timeline'
        timelineId={`hashtag:${id}`}
        onLoadMore={handleLoadMore}
        emptyMessage={<FormattedMessage id='empty_column.hashtag' defaultMessage='There is nothing in this hashtag yet.' />}
        divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
      />
    </Column>
  );
};

export { HashtagTimeline as default };

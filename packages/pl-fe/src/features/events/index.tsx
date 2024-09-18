import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchJoinedEvents, fetchRecentEvents } from 'pl-fe/actions/events';
import {
  Button,
  CardBody,
  CardHeader,
  CardTitle,
  Column,
  HStack,
} from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';
import { useModalsStore } from 'pl-fe/stores';

import EventCarousel from './components/event-carousel';

const messages = defineMessages({
  title: { id: 'column.events', defaultMessage: 'Events' },
});

const Events = () => {
  const intl = useIntl();

  const { openModal } = useModalsStore();
  const dispatch = useAppDispatch();

  const recentEvents = useAppSelector(
    (state) => state.status_lists.get('recent_events')!.items,
  );
  const recentEventsLoading = useAppSelector(
    (state) => state.status_lists.get('recent_events')!.isLoading,
  );
  const joinedEvents = useAppSelector(
    (state) => state.status_lists.get('joined_events')!.items,
  );
  const joinedEventsLoading = useAppSelector(
    (state) => state.status_lists.get('joined_events')!.isLoading,
  );

  const onComposeEvent = () => {
    openModal('COMPOSE_EVENT');
  };

  useEffect(() => {
    dispatch(fetchRecentEvents());
    dispatch(fetchJoinedEvents());
  }, []);

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <HStack className='mb-2' space={2} justifyContent='between'>
        <CardTitle
          title={
            <FormattedMessage
              id='events.recent_events'
              defaultMessage='Recent events'
            />
          }
        />
        <Button
          className='ml-auto xl:hidden'
          theme='primary'
          size='sm'
          onClick={onComposeEvent}
        >
          <FormattedMessage
            id='events.create_event'
            defaultMessage='Create event'
          />
        </Button>
      </HStack>
      <CardBody className='mb-2'>
        <EventCarousel
          statusIds={recentEvents}
          isLoading={recentEventsLoading}
          emptyMessage={
            <FormattedMessage
              id='events.recent_events.empty'
              defaultMessage='There are no public events yet.'
            />
          }
        />
      </CardBody>
      <CardHeader className='mb-2'>
        <CardTitle
          title={
            <FormattedMessage
              id='events.joined_events'
              defaultMessage='Joined events'
            />
          }
        />
      </CardHeader>
      <CardBody>
        <EventCarousel
          statusIds={joinedEvents}
          isLoading={joinedEventsLoading}
          emptyMessage={
            <FormattedMessage
              id='events.joined_events.empty'
              defaultMessage="You haven't joined any event yet."
            />
          }
        />
      </CardBody>
    </Column>
  );
};

export { Events as default };

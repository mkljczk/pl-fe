import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useModalsStore } from 'pl-fe/stores/modals';

const NewEventPanel = () => {
  const { openModal } = useModalsStore();

  const createEvent = () => {
    openModal('COMPOSE_EVENT');
  };

  return (
    <Stack space={2}>
      <Stack>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='new_event_panel.title' defaultMessage='Create New Event' />
        </Text>

        <Text theme='muted' size='sm'>
          <FormattedMessage id='new_event_panel.subtitle' defaultMessage="Can't find what you're looking for? Schedule your own event." />
        </Text>
      </Stack>

      <Button
        icon={require('@tabler/icons/outline/calendar-event.svg')}
        onClick={createEvent}
        theme='secondary'
        block
      >
        <FormattedMessage id='new_event_panel.action' defaultMessage='Create event' />
      </Button>
    </Stack>
  );
};

export { NewEventPanel as default };

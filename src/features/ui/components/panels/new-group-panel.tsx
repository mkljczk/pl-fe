import React from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { Button, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

const NewGroupPanel = () => {
  const dispatch = useAppDispatch();

  const createGroup = () => {
    dispatch(openModal('CREATE_GROUP'));
  };

  return (
    <Stack space={2}>
      <Stack>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='new_group_panel.title' defaultMessage='Create group' />
        </Text>

        <Text theme='muted' size='sm'>
          <FormattedMessage id='new_group_panel.subtitle' defaultMessage="Can't find what you're looking for? Start your own private or public group." />
        </Text>
      </Stack>

      <Button
        onClick={createGroup}
        theme='secondary'
        block
      >
        <FormattedMessage id='new_group_panel.action' defaultMessage='Create Group' />
      </Button>
    </Stack>
  );
};

export { NewGroupPanel as default };

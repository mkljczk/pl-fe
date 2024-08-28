import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useRelays } from 'pl-fe/api/hooks/admin';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { Button, Column, Form, HStack, Input, Stack, Text } from 'pl-fe/components/ui';
import { useTextField } from 'pl-fe/hooks/forms';
import toast from 'pl-fe/toast';

import type { AdminRelay as RelayEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.relays', defaultMessage: 'Instance relays' },
  relayDeleteSuccess: { id: 'admin.relays.deleted', defaultMessage: 'Relay unfollowed' },
  label: { id: 'admin.relays.new.url_placeholder', defaultMessage: 'Instance relay URL' },
  createSuccess: { id: 'admin.relays.add.success', defaultMessage: 'Instance relay followed' },
  createFail: { id: 'admin.relays.add.fail', defaultMessage: 'Failed to follow the instance relay' },
});

interface IRelay {
  relay: RelayEntity;
}

const Relay: React.FC<IRelay> = ({ relay }) => {
  const { unfollowRelay } = useRelays();

  const handleDeleteRelay = () => () => {
    unfollowRelay(relay.actor, {
      onSuccess: () => {
        toast.success(messages.relayDeleteSuccess);
      },
    });
  };

  return (
    <div key={relay.id} className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
      <Stack space={2}>
        <HStack alignItems='center' space={4} wrap>
          <Text size='sm'>
            <Text tag='span' size='sm' weight='medium'>
              <FormattedMessage id='admin.relays.url' defaultMessage='Instance URL:' />
            </Text>
            {' '}
            {relay.actor}
          </Text>
          {relay.followed_back && (
            <Text tag='span' size='sm' weight='medium'>
              <FormattedMessage id='admin.relays.followed_back' defaultMessage='Followed back' />
            </Text>
          )}
        </HStack>
        <HStack justifyContent='end' space={2}>
          <Button theme='primary' onClick={handleDeleteRelay()}>
            <FormattedMessage id='admin.relays.unfollow' defaultMessage='Unfollow' />
          </Button>
        </HStack>
      </Stack>
    </div>
  );
};

const NewRelayForm: React.FC = () => {
  const intl = useIntl();

  const name = useTextField();

  const { followRelay, isPendingFollow } = useRelays();

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    followRelay(name.value, {
      onSuccess() {
        toast.success(messages.createSuccess);
      },
      onError() {
        toast.error(messages.createFail);
      },
    });
  };

  const label = intl.formatMessage(messages.label);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2} alignItems='center'>
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input
            type='text'
            placeholder={label}
            disabled={isPendingFollow}
            {...name}
          />
        </label>

        <Button
          disabled={isPendingFollow}
          onClick={handleSubmit}
          theme='primary'
        >
          <FormattedMessage id='admin.relays.new.follow' defaultMessage='Follow' />
        </Button>
      </HStack>
    </Form>
  );
};

const Relays: React.FC = () => {
  const intl = useIntl();

  const { data: relays, isFetching } = useRelays();

  const emptyMessage = <FormattedMessage id='empty_column.admin.relays' defaultMessage='There are no relays followed yet.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack className='gap-4'>
        <NewRelayForm />

        {relays && (
          <ScrollableList
            scrollKey='relays'
            emptyMessage={emptyMessage}
            itemClassName='py-3 first:pt-0 last:pb-0'
            isLoading={isFetching}
            showLoading={isFetching && !relays?.length}
          >
            {relays.map((relay) => (
              <Relay key={relay.id} relay={relay} />
            ))}
          </ScrollableList>
        )}
      </Stack>
    </Column>
  );
};

export { Relays as default };

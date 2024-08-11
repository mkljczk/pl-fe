import React, { useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { createSelector } from 'reselect';

import { fetchLists } from 'soapbox/actions/lists';
import List, { ListItem } from 'soapbox/components/list';
import { Card, Column, HStack, Icon, Spinner, Stack } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import NewListForm from './components/new-list-form';

import type { RootState } from 'soapbox/store';

const messages = defineMessages({
  heading: { id: 'column.lists', defaultMessage: 'Lists' },
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
});

const getOrderedLists = createSelector([(state: RootState) => state.lists], lists => {
  if (!lists) {
    return lists;
  }

  return lists.toList().filter((item) => !!item).sort((a, b) => a.title.localeCompare(b.title));
});

const Lists: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const lists = useAppSelector((state) => getOrderedLists(state));

  useEffect(() => {
    dispatch(fetchLists());
  }, []);

  if (!lists) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.lists' defaultMessage="You don't have any lists yet. When you create one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <NewListForm />

        {lists.isEmpty() ? (
          <Card variant='rounded' size='lg'>
            {emptyMessage}
          </Card>
        ) : (
          <List>
            {lists.map((list: any) => (
              <ListItem
                key={list.id}
                to={`/list/${list.id}`}
                label={
                  <HStack alignItems='center' space={2}>
                    <Icon src={require('@tabler/icons/outline/list.svg')} size={20} />
                    <span>{list.title}</span>
                  </HStack>
                }
              />
            ))}
          </List>
        )}
      </Stack>
    </Column>
  );
};

export { Lists as default };

import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { createSelector } from 'reselect';

import { fetchLists } from 'pl-fe/actions/lists';
import List, { ListItem } from 'pl-fe/components/list';
import {
  Card,
  Column,
  HStack,
  Icon,
  Spinner,
  Stack,
} from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

import NewListForm from './components/new-list-form';

import type { List as ListEntity } from 'pl-api';
import type { RootState } from 'pl-fe/store';

const messages = defineMessages({
  heading: { id: 'column.lists', defaultMessage: 'Lists' },
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
});

const getOrderedLists = createSelector(
  [(state: RootState) => state.lists],
  (lists) => {
    if (!lists) {
      return lists;
    }

    return lists
      .toList()
      .filter((item): item is ListEntity => !!item)
      .sort((a, b) => a.title.localeCompare(b.title));
  },
);

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

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.lists'
      defaultMessage="You don't have any lists yet. When you create one, it will show up here."
    />
  );

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
                    <Icon
                      src={require('@tabler/icons/outline/list.svg')}
                      size={20}
                    />
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

export { Lists as default, getOrderedLists };

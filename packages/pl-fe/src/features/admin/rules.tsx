import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useRules } from 'pl-fe/api/hooks/admin';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { Button, Column, HStack, Stack, Text } from 'pl-fe/components/ui';
import { useModalsStore } from 'pl-fe/stores';
import toast from 'pl-fe/toast';

import type { AdminRule } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.rules', defaultMessage: 'Instance rules' },
  deleteConfirm: {
    id: 'confirmations.admin.delete_rule.confirm',
    defaultMessage: 'Delete',
  },
  deleteHeading: {
    id: 'confirmations.admin.delete_rule.heading',
    defaultMessage: 'Delete rule',
  },
  deleteMessage: {
    id: 'confirmations.admin.delete_rule.message',
    defaultMessage: 'Are you sure you want to delete the rule?',
  },
  ruleDeleteSuccess: {
    id: 'admin.edit_rule.deleted',
    defaultMessage: 'Rule deleted',
  },
});

interface IRule {
  rule: AdminRule;
}

const Rule: React.FC<IRule> = ({ rule }) => {
  const intl = useIntl();
  const { openModal } = useModalsStore();
  const { deleteRule } = useRules();

  const handleEditRule = (rule: AdminRule) => () => {
    openModal('EDIT_RULE', { rule });
  };

  const handleDeleteRule = (id: string) => () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () =>
        deleteRule(id, {
          onSuccess: () => toast.success(messages.ruleDeleteSuccess),
        }),
    });
  };

  return (
    <div
      key={rule.id}
      className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'
    >
      <Stack space={2}>
        <Text>{rule.text}</Text>
        <Text tag='span' theme='muted' size='sm'>
          {rule.hint}
        </Text>
        {rule.priority !== null && (
          <Text size='sm'>
            <Text tag='span' size='sm' weight='medium'>
              <FormattedMessage
                id='admin.rule.priority'
                defaultMessage='Priority:'
              />
            </Text>{' '}
            {rule.priority}
          </Text>
        )}
        <HStack justifyContent='end' space={2}>
          <Button theme='primary' onClick={handleEditRule(rule)}>
            <FormattedMessage id='admin.rules.edit' defaultMessage='Edit' />
          </Button>
          <Button theme='primary' onClick={handleDeleteRule(rule.id)}>
            <FormattedMessage id='admin.rules.delete' defaultMessage='Delete' />
          </Button>
        </HStack>
      </Stack>
    </div>
  );
};

const Rules: React.FC = () => {
  const intl = useIntl();

  const { openModal } = useModalsStore();
  const { data, isLoading } = useRules();

  const handleCreateRule = () => {
    openModal('EDIT_RULE');
  };

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.admin.rules'
      defaultMessage='There are no instance rules yet.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack className='gap-4'>
        <Button
          className='sm:w-fit sm:self-end'
          icon={require('@tabler/icons/outline/plus.svg')}
          onClick={handleCreateRule}
          theme='secondary'
          block
        >
          <FormattedMessage
            id='admin.rules.action'
            defaultMessage='Create rule'
          />
        </Button>
        <ScrollableList
          scrollKey='rules'
          emptyMessage={emptyMessage}
          itemClassName='py-3 first:pt-0 last:pb-0'
          isLoading={isLoading}
          showLoading={isLoading}
        >
          {data!.map((rule) => (
            <Rule key={rule.id} rule={rule} />
          ))}
        </ScrollableList>
      </Stack>
    </Column>
  );
};

export { Rules as default };

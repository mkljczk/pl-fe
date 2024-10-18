import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useInteractionPolicies } from 'pl-fe/api/hooks';
import List, { ListItem } from 'pl-fe/components/list';
import { Button, CardTitle, Column, Form, FormActions, Tabs } from 'pl-fe/components/ui';
import { InlineMultiselect } from 'pl-fe/components/ui/inline-multiselect';
import toast from 'pl-fe/toast';

import Warning from '../compose/components/warning';

type Visibility = 'public' | 'unlisted' | 'private';
type Policy = 'can_favourite' | 'can_reblog' | 'can_reply';
type Rule = 'always' | 'with_approval';
type Scope = 'followers' | 'following' | 'mentioned' | 'public';

const policies: Array<Policy> = ['can_favourite', 'can_reply', 'can_reblog'];

const messages = defineMessages({
  heading: { id: 'column.interaction_policies', defaultMessage: 'Interaction policies' },
  public: { id: 'interaction_policies.tabs.public', defaultMessage: 'Public' },
  unlisted: { id: 'interaction_policies.tabs.unlisted', defaultMessage: 'Unlisted' },
  private: { id: 'interaction_policies.tabs.private', defaultMessage: 'Followers-only' },
  submit: { id: 'interaction_policies.update', defaultMessage: 'Update' },
  success: { id: 'interaction_policies.success', defaultMessage: 'Updated interaction policies' },
  fail: { id: 'interaction_policies.fail', defaultMessage: 'Failed to update interaction policies' },
  always: { id: 'interaction_policies.rule.always', defaultMessage: 'Always' },
  with_approval: { id: 'interaction_policies.rule.with_approval', defaultMessage: 'Require approval' },
});

const scopeMessages = defineMessages({
  followers: { id: 'interaction_policies.entry.followers', defaultMessage: 'Followers' },
  following: { id: 'interaction_policies.entry.following', defaultMessage: 'People I follow' },
  mentioned: { id: 'interaction_policies.entry.mentioned', defaultMessage: 'Mentioned' },
  public: { id: 'interaction_policies.entry.public', defaultMessage: 'Everyone' },
});

const titleMessages = {
  public: defineMessages({
    can_favourite: { id: 'interaction_policies.title.public.can_favourite', defaultMessage: 'Who can like a public post?' },
    can_reply: { id: 'interaction_policies.title.public.can_reply', defaultMessage: 'Who can reply to a public post?' },
    can_reblog: { id: 'interaction_policies.title.public.can_reblog', defaultMessage: 'Who can repost a public post?' },
  }),
  unlisted: defineMessages({
    can_favourite: { id: 'interaction_policies.title.unlisted.can_favourite', defaultMessage: 'Who can like an unlisted post?' },
    can_reply: { id: 'interaction_policies.title.unlisted.can_reply', defaultMessage: 'Who can reply to an unlisted post?' },
    can_reblog: { id: 'interaction_policies.title.unlisted.can_reblog', defaultMessage: 'Who can repost an unlisted post?' },
  }),
  private: defineMessages({
    can_favourite: { id: 'interaction_policies.title.private.can_favourite', defaultMessage: 'Who can like a followers-only post?' },
    can_reply: { id: 'interaction_policies.title.private.can_reply', defaultMessage: 'Who can reply to a followers-only post?' },
    can_reblog: { id: 'interaction_policies.title.private.can_reblog', defaultMessage: 'Who can repost a followers-only post?' },
  }),
};

const options: Record<Visibility, Record<Policy, Array<Scope>>> = {
  public: {
    can_favourite: ['followers', 'following', 'mentioned', 'public'],
    can_reblog: ['followers', 'following', 'mentioned', 'public'],
    can_reply: ['followers', 'following', 'public'],
  },
  unlisted: {
    can_favourite: ['followers', 'following', 'mentioned', 'public'],
    can_reblog: ['followers', 'following', 'mentioned', 'public'],
    can_reply: ['followers', 'following', 'public'],
  },
  private: {
    can_favourite: ['followers'],
    can_reblog: [],
    can_reply: ['followers'],
  },
};

const InteractionPolicies = () => {
  const { interactionPolicies: initial, updateInteractionPolicies, isUpdating } = useInteractionPolicies();
  const intl = useIntl();
  const [interactionPolicies, setInteractionPolicies] = useState(initial);
  const [visibility, setVisibility] = useState<Visibility>('public');

  useEffect(() => {
    setInteractionPolicies(initial);
  }, [initial]);

  const getItems = (visibility: Visibility, policy: Policy) => Object.fromEntries(options[visibility][policy].map(scope => [scope, intl.formatMessage(scopeMessages[scope])])) as Record<Scope, string>;

  const handleChange = (visibility: Visibility, policy: Policy, rule: Rule) => (value: Array<Scope>) => {
    const newPolicies = { ...interactionPolicies };
    newPolicies[visibility][policy][rule] = value;
    newPolicies[visibility][policy][rule === 'always' ? 'with_approval' : 'always'] = newPolicies[visibility][policy][rule === 'always' ? 'with_approval' : 'always'].filter(rule => !value.includes(rule as any));

    setInteractionPolicies(newPolicies);
  };

  const handleSubmit = () => {
    updateInteractionPolicies(interactionPolicies, {
      onSuccess: () => toast.success(messages.success),
      onError: () => toast.success(messages.fail),
    });
  };

  const renderPolicy = (visibility: 'public' | 'unlisted' | 'private') => (
    <>
      {policies.map((policy) => {
        const items = getItems(visibility, policy);

        if (!Object.keys(items).length) return null;

        return (
          <React.Fragment key={policy}>
            <CardTitle
              title={intl.formatMessage(titleMessages[visibility][policy])}
            />

            {policy === 'can_reply' && (
              <Warning message={<FormattedMessage id='interaction_policies.mentioned_warning' defaultMessage='Mentioned users can always reply.' />} />
            )}

            <List>
              <ListItem label={intl.formatMessage(messages.always)}>
                <InlineMultiselect<Scope>
                  items={items}
                  value={interactionPolicies[visibility][policy].always as Array<Scope>}
                  onChange={handleChange(visibility, policy, 'always')}
                  disabled={isUpdating}
                />
              </ListItem>
              <ListItem label={intl.formatMessage(messages.with_approval)}>
                <InlineMultiselect
                  items={items}
                  value={interactionPolicies[visibility][policy].with_approval as Array<Scope>}
                  onChange={handleChange(visibility, policy, 'with_approval')}
                  disabled={isUpdating}
                />
              </ListItem>
            </List>
          </React.Fragment>
        );
      })}
    </>
  );

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref='/settings'>
      <Form onSubmit={handleSubmit}>
        <Tabs
          items={[
            {
              text: intl.formatMessage(messages.public),
              action: () => setVisibility('public'),
              name: 'public',
            },
            {
              text: intl.formatMessage(messages.unlisted),
              action: () => setVisibility('unlisted'),
              name: 'unlisted',
            },
            {
              text: intl.formatMessage(messages.private),
              action: () => setVisibility('private'),
              name: 'private',
            }]}
          activeItem={visibility}
        />

        {renderPolicy(visibility)}

        <FormActions>
          <Button type='submit' theme='primary' disabled={isUpdating}>
            {intl.formatMessage(messages.submit)}
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { InteractionPolicies as default };

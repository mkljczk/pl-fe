import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeSpoilerness } from 'pl-fe/actions/compose';
import { useAppDispatch, useCompose } from 'pl-fe/hooks';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  marked: { id: 'compose_form.spoiler.marked', defaultMessage: 'Media is marked as sensitive' },
  unmarked: { id: 'compose_form.spoiler.unmarked', defaultMessage: 'Media is not marked as sensitive' },
});

interface ISpoilerButton {
  composeId: string;
}

const SpoilerButton: React.FC<ISpoilerButton> = ({ composeId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const active = useCompose(composeId).sensitive;

  const onClick = () =>
    dispatch(changeComposeSpoilerness(composeId));

  return (
    <ComposeFormButton
      icon={require('@tabler/icons/outline/alert-triangle.svg')}
      title={intl.formatMessage(active ? messages.marked : messages.unmarked)}
      active={active}
      onClick={onClick}
    />
  );
};

export { SpoilerButton as default };

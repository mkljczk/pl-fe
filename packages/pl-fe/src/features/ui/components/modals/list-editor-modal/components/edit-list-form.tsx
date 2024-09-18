import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeListEditorTitle, submitListEditor } from 'pl-fe/actions/lists';
import { Button, Form, HStack, Input } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

const messages = defineMessages({
  title: { id: 'lists.edit.submit', defaultMessage: 'Change title' },
  save: { id: 'lists.new.save_title', defaultMessage: 'Save title' },
});

const ListForm = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const value = useAppSelector((state) => state.listEditor.title);
  const disabled = useAppSelector((state) => !state.listEditor.isChanged);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    dispatch(changeListEditorTitle(e.target.value));
  };

  const handleSubmit: React.FormEventHandler<Element> = (e) => {
    e.preventDefault();
    dispatch(submitListEditor(false));
  };

  const handleClick = () => {
    dispatch(submitListEditor(false));
  };

  const save = intl.formatMessage(messages.save);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2}>
        <Input
          outerClassName='grow'
          type='text'
          value={value}
          onChange={handleChange}
        />

        <Button onClick={handleClick} disabled={disabled}>
          {save}
        </Button>
      </HStack>
    </Form>
  );
};

export { ListForm as default };

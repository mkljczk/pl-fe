import React, { useState } from 'react';
import { MessageDescriptor, useIntl } from 'react-intl';

import { Button, FileInput, Form, FormActions, FormGroup, Text } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import type { AppDispatch, RootState } from 'soapbox/store';

interface IDataImporter {
  messages: {
    input_label: MessageDescriptor;
    input_hint: MessageDescriptor;
    submit: MessageDescriptor;
  };
  action: (params: FormData) => (dispatch: AppDispatch, getState: () => RootState) => Promise<void>;
  paramName?: string;
  accept?: string;
}

const DataImporter: React.FC<IDataImporter> = ({ messages, action, paramName = 'list', accept = '.csv,text/csv' }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null | undefined>(null);

  const handleSubmit: React.FormEventHandler = (event) => {
    const params = new FormData();
    params.append(paramName, file!);

    setIsLoading(true);
    dispatch(action(params)).then(() => {
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    event.preventDefault();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.item(0);
    setFile(file);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Text size='xl' weight='bold' tag='label'>{intl.formatMessage(messages.input_label)}</Text>
      <FormGroup
        hintText={<Text theme='muted'>{intl.formatMessage(messages.input_hint)}</Text>}
      >
        <FileInput
          accept={accept}
          onChange={handleFileChange}
          required
        />
      </FormGroup>
      <FormActions>
        <Button type='submit' theme='primary' disabled={isLoading}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </FormActions>
    </Form>
  );
};

export { DataImporter as default };

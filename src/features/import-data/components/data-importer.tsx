import React, { useState } from 'react';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Button, FileInput, Form, FormActions, FormGroup, Text, Toggle } from 'soapbox/components/ui';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';

import type { AppDispatch, RootState } from 'soapbox/store';

interface IDataImporter {
  messages: {
    input_label: MessageDescriptor;
    input_hint: MessageDescriptor;
    submit: MessageDescriptor;
  };
  action: (list: File | string, overwrite?: boolean) => (dispatch: AppDispatch, getState: () => RootState) => Promise<void>;
  accept?: string;
  allowOverwrite?: boolean;
}

const DataImporter: React.FC<IDataImporter> = ({ messages, action, accept = '.csv,text/csv', allowOverwrite }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null | undefined>(null);
  const [overwrite, setOverwrite] = useState(false);

  const handleSubmit: React.FormEventHandler = (event) => {
    setIsLoading(true);
    dispatch(action(file!, overwrite)).then(() => {
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

      {features.importOverwrite && (
        <List>
          <ListItem
            label={<FormattedMessage id='import_data.overwrite' defaultMessage='Overwrite instead of appending' />}
          >
            <Toggle
              checked={overwrite}
              onChange={({ target }) => setOverwrite(target.checked)}
            />
          </ListItem>
        </List>
      )}

      <FormActions>
        <Button type='submit' theme='primary' disabled={isLoading}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </FormActions>
    </Form>
  );
};

export { DataImporter as default };

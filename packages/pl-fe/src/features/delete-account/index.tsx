import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { deleteAccount } from 'pl-fe/actions/security';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  FormActions,
  FormGroup,
  Input,
  Stack,
  Text,
} from 'pl-fe/components/ui';
import { useAppDispatch, useFeatures } from 'pl-fe/hooks';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  passwordFieldLabel: {
    id: 'security.fields.password.label',
    defaultMessage: 'Password',
  },
  deleteHeader: {
    id: 'security.headers.delete',
    defaultMessage: 'Delete account',
  },
  deleteText: {
    id: 'security.text.delete',
    defaultMessage:
      "To delete your account, enter your password then click Delete Account. This is a permanent action that cannot be undone. Your account will be destroyed from this server, and a deletion request will be sent to other servers. It's not guaranteed that all servers will purge your account.",
  },
  localDeleteText: {
    id: 'security.text.delete.local',
    defaultMessage:
      'To delete your account, enter your password then click Delete Account. This is a permanent action that cannot be undone.',
  },
  deleteSubmit: {
    id: 'security.submit.delete',
    defaultMessage: 'Delete account',
  },
  deleteAccountSuccess: {
    id: 'security.delete_account.success',
    defaultMessage: 'Account successfully deleted.',
  },
  deleteAccountFail: {
    id: 'security.delete_account.fail',
    defaultMessage: 'Account deletion failed.',
  },
});

const DeleteAccount = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const [password, setPassword] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.persist();

      setPassword(event.target.value);
    },
    [],
  );

  const handleSubmit = React.useCallback(() => {
    setLoading(true);
    dispatch(deleteAccount(password))
      .then(() => {
        setPassword('');
        toast.success(intl.formatMessage(messages.deleteAccountSuccess));
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(() => {
        setPassword('');
        toast.error(intl.formatMessage(messages.deleteAccountFail));
      });
  }, [password, dispatch, intl]);

  return (
    <Card variant='rounded'>
      <CardHeader backHref='/settings'>
        <CardTitle title={intl.formatMessage(messages.deleteHeader)} />
      </CardHeader>

      <CardBody>
        <Stack space={4}>
          <Text theme='muted'>
            {intl.formatMessage(
              features.federating
                ? messages.deleteText
                : messages.localDeleteText,
            )}
          </Text>

          <Form onSubmit={handleSubmit}>
            <FormGroup
              labelText={intl.formatMessage(messages.passwordFieldLabel)}
            >
              <Input
                type='password'
                name='password'
                onChange={handleInputChange}
                value={password}
              />
            </FormGroup>

            <FormActions>
              <Button type='submit' theme='danger' disabled={isLoading}>
                {intl.formatMessage(messages.deleteSubmit)}
              </Button>
            </FormActions>
          </Form>
        </Stack>
      </CardBody>
    </Card>
  );
};

export { DeleteAccount as default };

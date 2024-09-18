import React, { useState, useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchBackupCodes } from 'pl-fe/actions/mfa';
import { Button, FormActions, Spinner, Stack, Text } from 'pl-fe/components/ui';
import { useAppDispatch } from 'pl-fe/hooks';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  mfaCancelButton: { id: 'column.mfa_cancel', defaultMessage: 'Cancel' },
  mfaSetupButton: {
    id: 'column.mfa_setup',
    defaultMessage: 'Proceed to Setup',
  },
  codesFail: {
    id: 'security.codes.fail',
    defaultMessage: 'Failed to fetch backup codes',
  },
});

interface IEnableOtpForm {
  displayOtpForm: boolean;
  handleSetupProceedClick: (event: React.MouseEvent) => void;
}

const EnableOtpForm: React.FC<IEnableOtpForm> = ({
  displayOtpForm,
  handleSetupProceedClick,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const history = useHistory();

  const [backupCodes, setBackupCodes] = useState<Array<string>>([]);

  useEffect(() => {
    dispatch(fetchBackupCodes())
      .then(({ codes: backupCodes }) => {
        setBackupCodes(backupCodes);
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.codesFail));
      });
  }, []);

  return (
    <Stack space={4}>
      <Stack space={4}>
        <Text theme='muted'>
          <FormattedMessage
            id='mfa.setup_warning'
            defaultMessage="Write these codes down or save them somewhere secure - otherwise you won't see them again. If you lose access to your 2FA app and recovery codes you'll be locked out of your account."
          />
        </Text>

        <div className='rounded-lg border-2 border-solid border-gray-200 p-4 dark:border-gray-800'>
          <Stack space={3}>
            <Text weight='medium' align='center'>
              <FormattedMessage
                id='mfa.setup_recoverycodes'
                defaultMessage='Recovery codes'
              />
            </Text>

            {backupCodes.length > 0 ? (
              <div className='grid grid-cols-2 gap-3 rounded-lg text-center'>
                {backupCodes.map((code, i) => (
                  <Text key={i} theme='muted' size='sm'>
                    {code}
                  </Text>
                ))}
              </div>
            ) : (
              <Spinner />
            )}
          </Stack>
        </div>
      </Stack>

      {!displayOtpForm && (
        <FormActions>
          <Button
            theme='tertiary'
            text={intl.formatMessage(messages.mfaCancelButton)}
            onClick={() => history.push('../auth/edit')}
          />

          {backupCodes.length > 0 && (
            <Button
              theme='primary'
              text={intl.formatMessage(messages.mfaSetupButton)}
              onClick={handleSetupProceedClick}
            />
          )}
        </FormActions>
      )}
    </Stack>
  );
};

export { EnableOtpForm as default };

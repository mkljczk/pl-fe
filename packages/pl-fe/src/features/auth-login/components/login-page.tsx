import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { logIn, verifyCredentials, switchAccount } from 'soapbox/actions/auth';
import { fetchInstance } from 'soapbox/actions/instance';
import { closeModal } from 'soapbox/actions/modals';
import { BigCard } from 'soapbox/components/big-card';
import { Button, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { getRedirectUrl } from 'soapbox/utils/redirect';
import { isStandalone } from 'soapbox/utils/state';

import ConsumersList from './consumers-list';
import LoginForm from './login-form';
import OtpAuthForm from './otp-auth-form';

import type { PlfeResponse } from 'soapbox/api';

const LoginPage = () => {
  const dispatch = useAppDispatch();

  const me = useAppSelector((state) => state.me);
  const standalone = useAppSelector((state) => isStandalone(state));

  const token = new URLSearchParams(window.location.search).get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [mfaAuthNeeded, setMfaAuthNeeded] = useState(!!token);
  const [mfaToken, setMfaToken] = useState(token || '');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const getFormData = (form: HTMLFormElement) =>
    Object.fromEntries(
      Array.from(form).map((i: any) => [i.name, i.value]),
    );

  const handleSubmit: React.FormEventHandler = (event) => {
    const { username, password } = getFormData(event.target as HTMLFormElement);
    dispatch(logIn(username, password))
      .then(({ access_token }) => dispatch(verifyCredentials(access_token)))
      // Refetch the instance for authenticated fetch
      .then(async (account) => {
        await dispatch(fetchInstance());
        return account;
      })
      .then((account: { id: string }) => {
        dispatch(closeModal());
        if (typeof me === 'string') {
          dispatch(switchAccount(account.id));
        } else {
          setShouldRedirect(true);
        }
      }).catch((error: { response: PlfeResponse }) => {
        const data: any = error.response?.json;
        if (data?.error === 'mfa_required') {
          setMfaAuthNeeded(true);
          setMfaToken(data.mfa_token);
        }
        setIsLoading(false);
      });
    setIsLoading(true);
    event.preventDefault();
  };

  if (standalone) return <Redirect to='/login/external' />;

  if (shouldRedirect) {
    const redirectUri = getRedirectUrl();
    return <Redirect to={redirectUri} />;
  }

  if (mfaAuthNeeded) return <OtpAuthForm mfa_token={mfaToken} />;

  return (
    <BigCard title={<FormattedMessage id='login_form.header' defaultMessage='Sign in' />}>
      <Stack space={4}>
        <LoginForm handleSubmit={handleSubmit} isLoading={isLoading} />
        <ConsumersList />

        <div className={'flex items-center gap-2.5 before:flex-1 before:border-b before:border-gray-300 before:content-[\'\'] after:flex-1 after:border-b after:border-gray-300 after:content-[\'\'] before:dark:border-gray-800 after:dark:border-gray-800'}>
          <Text align='center'>
            <FormattedMessage id='login_form.divider' defaultMessage='or' />
          </Text>
        </div>

        <Button className='w-full' theme='secondary' to='/login/external'>
          <FormattedMessage id='login_form.external' defaultMessage='Sign in from remote instance' />
        </Button>

      </Stack>
    </BigCard>
  );
};

export { LoginPage as default };

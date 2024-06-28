import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, Redirect } from 'react-router-dom';

import { logIn, verifyCredentials } from 'soapbox/actions/auth';
import { fetchInstance } from 'soapbox/actions/instance';
import { Avatar, Button, Form, HStack, IconButton, Input, Tooltip } from 'soapbox/components/ui';
import Search from 'soapbox/features/compose/components/search';
import { useAppDispatch, useFeatures, useOwnAccount, useRegistrationStatus } from 'soapbox/hooks';

import ProfileDropdown from './profile-dropdown';

import type { PlfeResponse } from 'soapbox/api';

const messages = defineMessages({
  login: { id: 'navbar.login.action', defaultMessage: 'Log in' },
  username: { id: 'navbar.login.username.placeholder', defaultMessage: 'Email or username' },
  email: { id: 'navbar.login.email.placeholder', defaultMessage: 'E-mail address' },
  password: { id: 'navbar.login.password.label', defaultMessage: 'Password' },
  forgotPassword: { id: 'navbar.login.forgot_password', defaultMessage: 'Forgot password?' },
});

const Navbar = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const { isOpen } = useRegistrationStatus();
  const { account } = useOwnAccount();
  const node = useRef(null);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [mfaToken, setMfaToken] = useState<boolean>(false);

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    setLoading(true);

    dispatch(logIn(username, password) as any)
      .then(({ access_token }: { access_token: string }) => {
        setLoading(false);

        return (
          dispatch(verifyCredentials(access_token) as any)
            // Refetch the instance for authenticated fetch
            .then(() => dispatch(fetchInstance()))
        );
      })
      .catch((error: { response: PlfeResponse }) => {
        setLoading(false);

        const data: any = error.response?.json;
        if (data?.error === 'mfa_required') {
          setMfaToken(data.mfa_token);
        }
      });
  };

  if (mfaToken) return <Redirect to={`/login?token=${encodeURIComponent(mfaToken)}`} />;

  return (
    <nav
      className={clsx(
        'sticky top-0 z-50 hidden border-gray-200 bg-white shadow black:border-b black:border-b-gray-800 black:bg-black lg:block dark:border-gray-800 dark:bg-primary-900',
      )}
      ref={node}
      data-testid='navbar'
    >
      <div className='mx-auto max-w-7xl px-8'>
        <div className='relative flex h-16 justify-between'>
          <HStack
            space={4}
            alignItems='center'
            className={clsx('enter flex-1 items-stretch', {
              'justify-center justify-start': account,
              'justify-start': !account,
            })}
          >
            {account && (
              <div className='flex flex-1 items-center justify-start pl-0'>
                <div className='block w-full max-w-xs'>
                  <Search openInRoute autosuggest />
                </div>
              </div>
            )}
          </HStack>

          <HStack space={3} alignItems='center'>
            {account ? (
              <div className='relative flex items-center'>
                <ProfileDropdown account={account}>
                  <Avatar src={account.avatar} size={34} />
                </ProfileDropdown>
              </div>
            ) : (
              <>
                <Form className='hidden items-center space-x-2 xl:flex rtl:space-x-reverse' onSubmit={handleSubmit}>
                  <Input
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    type='text'
                    placeholder={intl.formatMessage(features.logInWithUsername ? messages.username : messages.email)}
                    className='max-w-[200px]'
                  />

                  <Input
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type='password'
                    placeholder={intl.formatMessage(messages.password)}
                    className='max-w-[200px]'
                  />

                  <Link to='/reset-password'>
                    <Tooltip text={intl.formatMessage(messages.forgotPassword)}>
                      <IconButton
                        src={require('@tabler/icons/outline/help.svg')}
                        className='cursor-pointer bg-transparent text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200'
                        iconClassName='h-5 w-5'
                      />
                    </Tooltip>
                  </Link>

                  <Button
                    theme='primary'
                    type='submit'
                    disabled={isLoading}
                  >
                    {intl.formatMessage(messages.login)}
                  </Button>
                </Form>

                <div className='space-x-1.5 xl:hidden'>
                  <Button
                    theme='tertiary'
                    size='sm'
                    to='/login'
                  >
                    <FormattedMessage id='account.login' defaultMessage='Log in' />
                  </Button>

                  {(isOpen) && (
                    <Button theme='primary' to='/signup' size='sm'>
                      <FormattedMessage id='account.register' defaultMessage='Sign up' />
                    </Button>
                  )}
                </div>
              </>
            )}
          </HStack>
        </div>
      </div>
    </nav>
  );
};

export { Navbar as default };

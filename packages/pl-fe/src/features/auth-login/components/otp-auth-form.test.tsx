import React from 'react';

import { render, screen } from 'pl-fe/jest/test-helpers';

import OtpAuthForm from './otp-auth-form';

describe('<OtpAuthForm />', () => {
  it('renders correctly', () => {
    render(<OtpAuthForm mfa_token='12345' />);

    expect(screen.getByRole('heading')).toHaveTextContent('OTP Login');
    expect(screen.getByTestId('form')).toBeInTheDocument();
  });
});

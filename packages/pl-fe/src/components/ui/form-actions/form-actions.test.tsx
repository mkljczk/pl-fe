import React from 'react';

import { render, screen } from 'pl-fe/jest/test-helpers';

import FormActions from './form-actions';

describe('<FormActions />', () => {
  it('renders successfully', () => {
    render(
      <FormActions>
        <div data-testid='child'>child</div>
      </FormActions>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

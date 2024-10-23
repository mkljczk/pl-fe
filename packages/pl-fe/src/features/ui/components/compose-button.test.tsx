import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { mockStore, rootState } from 'pl-fe/jest/test-helpers';

import ComposeButton from './compose-button';

const store = mockStore(rootState);
const renderComposeButton = () => {
  render(
    <Provider store={store}>
      <IntlProvider locale='en'>
        <MemoryRouter>
          <ComposeButton />
        </MemoryRouter>
      </IntlProvider>
    </Provider>,
  );
};

describe('<ComposeButton />', () => {
  it('renders a button element', () => {
    renderComposeButton();

    expect(screen.getByRole('button')).toHaveTextContent('Compose');
  });

  it('dispatches the MODAL_OPEN action', () => {
    renderComposeButton();

    expect(store.getActions().length).toEqual(0);
    fireEvent.click(screen.getByRole('button'));
    expect(store.getActions()[0].type).toEqual('MODAL_CLOSE');
    expect(store.getActions()[1].type).toEqual('MODAL_OPEN');
  });
});

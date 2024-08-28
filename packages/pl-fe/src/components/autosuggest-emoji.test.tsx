import React from 'react';

import { render, screen } from 'pl-fe/jest/test-helpers';

import AutosuggestEmoji from './autosuggest-emoji';

describe('<AutosuggestEmoji />', () => {
  it('renders native emoji', () => {
    const emoji = {
      native: '💙',
      colons: ':foobar:',
    };

    render(<AutosuggestEmoji emoji={emoji as any} />);

    expect(screen.getByTestId('emoji')).toHaveTextContent('foobar');
    expect(screen.getByRole('img').getAttribute('src')).not.toBe('http://example.com/emoji.png');
  });

  it('renders emoji with custom url', () => {
    const emoji = {
      custom: true,
      imageUrl: 'http://example.com/emoji.png',
      native: 'foobar',
      colons: ':foobar:',
    };

    render(<AutosuggestEmoji emoji={emoji as any} />);

    expect(screen.getByTestId('emoji')).toHaveTextContent('foobar');
    expect(screen.getByRole('img').getAttribute('src')).toBe('http://example.com/emoji.png');
  });
});

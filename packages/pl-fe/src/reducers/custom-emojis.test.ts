import { List as ImmutableList } from 'immutable';

import reducer from './custom-emojis';

describe('custom_emojis reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual(ImmutableList());
  });
});

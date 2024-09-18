import { Map as ImmutableMap } from 'immutable';

import { POLLS_IMPORT } from 'pl-fe/actions/importer';

import reducer from './polls';

describe('polls reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual(ImmutableMap());
  });

  describe('POLLS_IMPORT', () => {
    it('normalizes the poll', () => {
      const polls = [
        { id: '3', options: [{ title: 'Apples' }, { title: 'Oranges' }] },
      ];
      const action = { type: POLLS_IMPORT, polls };

      const result = reducer(undefined, action);

      const expected = {
        '3': {
          options: [
            { title: 'Apples', votes_count: 0 },
            { title: 'Oranges', votes_count: 0 },
          ],
          emojis: [],
          expired: false,
          multiple: false,
          voters_count: 0,
          votes_count: 0,
          own_votes: null,
          voted: false,
        },
      };

      expect(result.toJS()).toMatchObject(expected);
    });
  });
});

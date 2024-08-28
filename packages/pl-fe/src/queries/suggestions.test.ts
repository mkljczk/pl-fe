import { __stub } from 'pl-fe/api';
import { renderHook, waitFor } from 'pl-fe/jest/test-helpers';

import { useOnboardingSuggestions } from './suggestions';

describe('useOnboardingSuggestions', () => {
  describe('with a successful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v2/suggestions')
          .reply(200, [
            { source: 'staff', account: { id: '1', acct: 'a', account_avatar: 'https://example.com/some.jpg' } },
            { source: 'staff', account: { id: '2', acct: 'b', account_avatar: 'https://example.com/some.jpg' } },
          ], {
            link: '<https://example.com/api/v2/suggestions?since_id=1>; rel=\'prev\'',
          });
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(() => useOnboardingSuggestions());

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.data?.length).toBe(2);
    });
  });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v2/suggestions').networkError();
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(() => useOnboardingSuggestions());

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.error).toBeDefined();
    });
  });
});

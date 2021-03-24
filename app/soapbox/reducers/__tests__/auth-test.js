import reducer from '../auth';
import { Map as ImmutableMap, fromJS } from 'immutable';
import {
  AUTH_APP_CREATED,
  AUTH_LOGGED_IN,
  VERIFY_CREDENTIALS_FAIL,
} from 'soapbox/actions/auth';

describe('auth reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(ImmutableMap({
      app: ImmutableMap(),
      users: ImmutableMap(),
      tokens: ImmutableMap(),
      me: null,
    }));
  });

  describe('AUTH_APP_CREATED', () => {
    it('should copy in the app', () => {
      const token = { token_type: 'Bearer', access_token: 'ABCDEFG' };
      const action = { type: AUTH_APP_CREATED, app: token };

      const result = reducer(undefined, action);
      const expected = fromJS(token);

      expect(result.get('app')).toEqual(expected);
    });
  });

  describe('AUTH_LOGGED_IN', () => {
    it('should import the token', () => {
      const token = { token_type: 'Bearer', access_token: 'ABCDEFG' };
      const action = { type: AUTH_LOGGED_IN, token };

      const result = reducer(undefined, action);
      const expected = fromJS({ 'ABCDEFG': token });

      expect(result.get('tokens')).toEqual(expected);
    });

    it('should merge the token with existing state', () => {
      const state = fromJS({
        tokens: { 'ABCDEFG': { token_type: 'Bearer', access_token: 'ABCDEFG' } },
      });

      const expected = fromJS({
        'ABCDEFG': { token_type: 'Bearer', access_token: 'ABCDEFG' },
        'HIJKLMN': { token_type: 'Bearer', access_token: 'HIJKLMN' },
      });

      const action = {
        type: AUTH_LOGGED_IN,
        token: { token_type: 'Bearer', access_token: 'HIJKLMN' },
      };

      const result = reducer(state, action);
      expect(result.get('tokens')).toEqual(expected);
    });
  });

  describe('VERIFY_CREDENTIALS_FAIL', () => {
    it('should delete the failed token', () => {
      const state = fromJS({
        tokens: {
          'ABCDEFG': { token_type: 'Bearer', access_token: 'ABCDEFG' },
          'HIJKLMN': { token_type: 'Bearer', access_token: 'HIJKLMN' },
        },
      });

      const expected = fromJS({
        'HIJKLMN': { token_type: 'Bearer', access_token: 'HIJKLMN' },
      });

      const action = { type: VERIFY_CREDENTIALS_FAIL, token: 'ABCDEFG' };
      const result = reducer(state, action);
      expect(result.get('tokens')).toEqual(expected);
    });

    it('should delete any users associated with the failed token', () => {
      const state = fromJS({
        users: {
          '1234': { id: '1234', access_token: 'ABCDEFG' },
          '5678': { id: '5678', access_token: 'HIJKLMN' },
        },
      });

      const expected = fromJS({
        '5678': { id: '5678', access_token: 'HIJKLMN' },
      });

      const action = { type: VERIFY_CREDENTIALS_FAIL, token: 'ABCDEFG' };
      const result = reducer(state, action);
      expect(result.get('users')).toEqual(expected);
    });

    it('should reassign `me` to the next in line', () => {
      const state = fromJS({
        me: '1234',
        users: {
          '1234': { id: '1234', access_token: 'ABCDEFG' },
          '5678': { id: '5678', access_token: 'HIJKLMN' },
        },
      });

      const action = { type: VERIFY_CREDENTIALS_FAIL, token: 'ABCDEFG' };
      const result = reducer(state, action);
      expect(result.get('me')).toEqual('5678');
    });
  });
});

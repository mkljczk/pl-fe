import { rootState } from 'pl-fe/jest/test-helpers';
import { RootState } from 'pl-fe/store';

import { getPlFeConfig } from './pl-fe';

const ASCII_HEART = '❤'; // '\u2764\uFE0F'
const RED_HEART_RGI = '❤️'; // '\u2764'

describe('getPlFeConfig()', () => {
  it('returns RGI heart on Pleroma > 2.3', () => {
    const state = rootState.setIn(['instance', 'version'], '2.7.2 (compatible; Pleroma 2.3.0)') as RootState;
    expect(getPlFeConfig(state).allowedEmoji.includes(RED_HEART_RGI)).toBe(true);
    expect(getPlFeConfig(state).allowedEmoji.includes(ASCII_HEART)).toBe(false);
  });

  it('returns an ASCII heart on Pleroma < 2.3', () => {
    const state = rootState.setIn(['instance', 'version'], '2.7.2 (compatible; Pleroma 2.0.0)') as RootState;
    expect(getPlFeConfig(state).allowedEmoji.includes(ASCII_HEART)).toBe(true);
    expect(getPlFeConfig(state).allowedEmoji.includes(RED_HEART_RGI)).toBe(false);
  });
});

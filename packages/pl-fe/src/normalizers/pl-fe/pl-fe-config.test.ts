import { Record as ImmutableRecord } from 'immutable';

import { normalizePlFeConfig } from './pl-fe-config';

describe('normalizePlFeConfig()', () => {
  it('adds base fields', () => {
    const result = normalizePlFeConfig({});
    expect(result.brandColor).toBe('');
    expect(ImmutableRecord.isRecord(result)).toBe(true);
  });

  it('normalizes cryptoAddresses', () => {
    const plFeConfig = {
      cryptoAddresses: [
        {
          ticker: '$BTC',
          address: 'bc1q9cx35adpm73aq2fw40ye6ts8hfxqzjr5unwg0n',
        },
      ],
    };

    const expected = {
      cryptoAddresses: [
        {
          ticker: 'btc',
          address: 'bc1q9cx35adpm73aq2fw40ye6ts8hfxqzjr5unwg0n',
          note: '',
        },
      ],
    };

    const result = normalizePlFeConfig(plFeConfig);
    expect(result.cryptoAddresses.size).toBe(1);
    expect(ImmutableRecord.isRecord(result.cryptoAddresses.get(0))).toBe(true);
    expect(result.toJS()).toMatchObject(expected);
  });

  it('upgrades singleUserModeProfile to redirectRootNoLogin', () => {
    expect(
      normalizePlFeConfig({
        singleUserMode: true,
        singleUserModeProfile: 'alex',
      }).redirectRootNoLogin,
    ).toBe('/@alex');
    expect(
      normalizePlFeConfig({
        singleUserMode: true,
        singleUserModeProfile: '@alex',
      }).redirectRootNoLogin,
    ).toBe('/@alex');
    expect(
      normalizePlFeConfig({
        singleUserMode: true,
        singleUserModeProfile: 'alex@gleasonator.com',
      }).redirectRootNoLogin,
    ).toBe('/@alex@gleasonator.com');
    expect(
      normalizePlFeConfig({
        singleUserMode: false,
        singleUserModeProfile: 'alex',
      }).redirectRootNoLogin,
    ).toBe('');
  });

  it('normalizes redirectRootNoLogin', () => {
    expect(
      normalizePlFeConfig({ redirectRootNoLogin: 'benis' }).redirectRootNoLogin,
    ).toBe('/benis');
    expect(
      normalizePlFeConfig({ redirectRootNoLogin: '/benis' })
        .redirectRootNoLogin,
    ).toBe('/benis');
    expect(
      normalizePlFeConfig({ redirectRootNoLogin: '/' }).redirectRootNoLogin,
    ).toBe('');
  });
});

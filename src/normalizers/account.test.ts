import { Record as ImmutableRecord, fromJS } from 'immutable';

import AVATAR_MISSING from 'soapbox/assets/images/avatar-missing.png';
import HEADER_MISSING from 'soapbox/assets/images/header-missing.png';

import { normalizeAccount } from './account';

describe('normalizeAccount()', () => {
  it('adds base fields', () => {
    const account = {};
    const result = normalizeAccount(account);

    expect(ImmutableRecord.isRecord(result)).toBe(true);
    expect(result.acct).toEqual('');
    expect(result.note).toEqual('');
    expect(result.avatar).toEqual(AVATAR_MISSING);
    expect(result.header_static).toEqual(HEADER_MISSING);
  });

  it('normalizes a mention', () => {
    const mention = {
      acct: 'NEETzsche@iddqd.social',
      id: '9v5bw7hEGBPc9nrpzc',
      url: 'https://iddqd.social/users/NEETzsche',
      username: 'NEETzsche',
    };

    const result = normalizeAccount(mention);
    expect(result.emojis).toEqual(fromJS([]));
    expect(result.display_name).toEqual('NEETzsche');
    expect(result.avatar).toEqual(AVATAR_MISSING);
    expect(result.avatar_static).toEqual(AVATAR_MISSING);
    expect(result.verified).toBe(false);
  });

  it('normalizes Fedibird birthday', async () => {
    const account = await import('soapbox/__fixtures__/fedibird-account.json');
    const result = normalizeAccount(account);

    expect(result.birthday).toEqual('1993-07-03');
  });

  it('normalizes Pleroma birthday', async () => {
    const account = await import('soapbox/__fixtures__/pleroma-account.json');
    const result = normalizeAccount(account);

    expect(result.birthday).toEqual('1993-07-03');
  });

  it('normalizes undefined birthday to empty string', async () => {
    const account = await import('soapbox/__fixtures__/mastodon-account.json');
    const result = normalizeAccount(account);

    expect(result.birthday).toEqual('');
  });

  it('normalizes Pleroma legacy fields', async () => {
    const account = await import('soapbox/__fixtures__/pleroma-2.2.2-account.json');
    const result = normalizeAccount(account);

    expect(result.getIn(['pleroma', 'is_active'])).toBe(true);
    expect(result.getIn(['pleroma', 'is_confirmed'])).toBe(true);
    expect(result.getIn(['pleroma', 'is_approved'])).toBe(true);

    expect(result.hasIn(['pleroma', 'confirmation_pending'])).toBe(false);
  });

  it('prefers new Pleroma fields', async () => {
    const account = await import('soapbox/__fixtures__/pleroma-account.json');
    const result = normalizeAccount(account);

    expect(result.getIn(['pleroma', 'is_active'])).toBe(true);
    expect(result.getIn(['pleroma', 'is_confirmed'])).toBe(true);
    expect(result.getIn(['pleroma', 'is_approved'])).toBe(true);
  });

  it('normalizes a verified Pleroma user', async () => {
    const account = await import('soapbox/__fixtures__/mk.json');
    const result = normalizeAccount(account);
    expect(result.verified).toBe(true);
  });

  it('normalizes an unverified Pleroma user', async () => {
    const account = await import('soapbox/__fixtures__/pleroma-account.json');
    const result = normalizeAccount(account);
    expect(result.verified).toBe(false);
  });

  it('normalizes Fedibird location', async () => {
    const account = await import('soapbox/__fixtures__/fedibird-account.json');
    const result = normalizeAccount(account);
    expect(result.location).toBe('Texas, USA');
  });

  it('sets display_name from username', () => {
    const account = { username: 'alex' };
    const result = normalizeAccount(account);
    expect(result.display_name).toBe('alex');
  });

  it('sets display_name from acct', () => {
    const account = { acct: 'alex@gleasonator.com' };
    const result = normalizeAccount(account);
    expect(result.display_name).toBe('alex');
  });

  it('overrides a whitespace display_name', () => {
    const account = { username: 'alex', display_name: ' ' };
    const result = normalizeAccount(account);
    expect(result.display_name).toBe('alex');
  });

  it('emojifies display name as `display_name_html`', async () => {
    const account = await import('soapbox/__fixtures__/account-with-emojis.json');
    const result = normalizeAccount(account);
    expect(result.display_name_html).toContain('emojione');
  });

  it('emojifies note as `note_emojified`', async () => {
    const account = await import('soapbox/__fixtures__/account-with-emojis.json');
    const result = normalizeAccount(account);
    expect(result.note_emojified).toContain('emojione');
  });

  it('unescapes HTML note as `note_plain`', async () => {
    const account = await import('soapbox/__fixtures__/account-with-emojis.json');
    const result = normalizeAccount(account);
    const expected = 'I create Fediverse software that empowers people online. :soapbox:\n\nI\'m vegan btw\n\nNote: If you have a question for me, please tag me publicly. This gives the opportunity for others to chime in, and bystanders to learn.';
    expect(result.note_plain).toBe(expected);
  });

  it('emojifies custom profile field', async () => {
    const account = await import('soapbox/__fixtures__/account-with-emojis.json');
    const result = normalizeAccount(account);
    const field = result.fields.get(1);

    expect(field?.name_emojified).toContain('emojione');
    expect(field?.value_emojified).toContain('emojione');
    expect(field?.value_plain).toBe('https://soapbox.pub :soapbox:');
  });

  it('adds default avatar and banner to GoToSocial account', async () => {
    const account = await import('soapbox/__fixtures__/gotosocial-account.json');
    const result = normalizeAccount(account);

    expect(result.avatar).toEqual(AVATAR_MISSING);
    expect(result.avatar_static).toEqual(AVATAR_MISSING);
    expect(result.header).toEqual(HEADER_MISSING);
    expect(result.header_static).toEqual(HEADER_MISSING);
  });

  it('adds fqn to Mastodon account', async () => {
    const account = await import('soapbox/__fixtures__/mastodon-account.json');
    const result = normalizeAccount(account);

    expect(result.fqn).toEqual('benis911@mastodon.social');
  });

  it('normalizes Pleroma staff', async () => {
    const account = await import('soapbox/__fixtures__/pleroma-account.json');
    const result = normalizeAccount(account);

    expect(result.admin).toBe(true);
    expect(result.staff).toBe(true);
    expect(result.moderator).toBe(false);
  });

  it('normalizes Pleroma favicon', async () => {
    const account = await import('soapbox/__fixtures__/pleroma-account.json');
    const result = normalizeAccount(account);

    expect(result.favicon).toEqual('https://gleasonator.com/favicon.png');
  });

  it('adds account domain', async () => {
    const account = await import('soapbox/__fixtures__/pleroma-account.json');
    const result = normalizeAccount(account);

    expect(result.domain).toEqual('gleasonator.com');
  });
});

import escapeTextContentForBrowser from 'escape-html';

import emojify from 'pl-fe/features/emoji';
import { unescapeHTML } from 'pl-fe/utils/html';
import { makeEmojiMap } from 'pl-fe/utils/normalizers';

import type { Account as BaseAccount } from 'pl-api';

const getDomainFromURL = (account: Pick<BaseAccount, 'url'>): string => {
  try {
    const url = account.url;
    return new URL(url).host;
  } catch {
    return '';
  }
};

const guessFqn = (account: Pick<BaseAccount, 'acct' | 'url'>): string => {
  const acct = account.acct;
  const [user, domain] = acct.split('@');

  if (domain) {
    return acct;
  } else {
    return [user, getDomainFromURL(account)].join('@');
  }
};

const normalizeAccount = (account: BaseAccount) => {
  const missingAvatar = require('pl-fe/assets/images/avatar-missing.png');
  const missingHeader = require('pl-fe/assets/images/header-missing.png');

  const fqn = account.fqn || guessFqn(account);
  const domain = fqn.split('@')[1] || '';
  const note = account.note === '<p></p>' ? '' : account.note;

  const emojiMap = makeEmojiMap(account.emojis);

  return {
    mute_expires_at: null,
    ...account,
    avatar: account.avatar || account.avatar_static || missingAvatar,
    avatar_static: account.avatar_static || account.avatar || missingAvatar,
    header: account.header || account.header_static || missingHeader,
    header_static: account.header_static || account.header || missingHeader,
    fqn,
    domain,
    note,
    display_name_html: emojify(escapeTextContentForBrowser(account.display_name), emojiMap),
    note_emojified: emojify(account.note, emojiMap),
    note_plain: unescapeHTML(account.note),
    fields: account.fields.map(field => ({
      ...field,
      name_emojified: emojify(escapeTextContentForBrowser(field.name), emojiMap),
      value_emojified: emojify(field.value, emojiMap),
      value_plain: unescapeHTML(field.value),
    })),
  };
};

type Account = ReturnType<typeof normalizeAccount>;

export { normalizeAccount, type Account };

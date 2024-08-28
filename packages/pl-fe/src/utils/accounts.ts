import range from 'lodash/range';

import type { Account } from 'pl-fe/normalizers';

const getDomainFromURL = (account: Pick<Account, 'url'>): string => {
  try {
    const url = account.url;
    return new URL(url).host;
  } catch {
    return '';
  }
};

const getDomain = (account: Pick<Account, 'acct' | 'url'>): string => {
  const domain = account.acct.split('@')[1];
  return domain ? domain : getDomainFromURL(account);
};

const getBaseURL = (account: Pick<Account, 'url'>): string => {
  try {
    return new URL(account.url).origin;
  } catch {
    return '';
  }
};

const getAcct = (account: Pick<Account, 'fqn' | 'acct'>, displayFqn: boolean): string => (
  displayFqn === true ? account.fqn : account.acct
);

/** Default header filenames from various backends */
const DEFAULT_HEADERS: string[] = [
  '/headers/original/missing.png', // Mastodon
  '/images/banner.png', // Pleroma
  '/assets/default_header.webp', // GoToSocial
  require('pl-fe/assets/images/header-missing.png'), // header not provided by backend
];

/** Check if the avatar is a default avatar */
const isDefaultHeader = (url: string) => DEFAULT_HEADERS.some(header => url.endsWith(header));

/** Default avatar filenames from various backends */
const DEFAULT_AVATARS = [
  '/avatars/original/missing.png', // Mastodon
  '/images/avi.png', // Pleroma
  ...(range(1, 6).map(i => `/assets/default_avatars/GoToSocial_icon${i}.webp`)), // GoToSocial
  '/assets/default_avatars/GoToSocial_icon2.webp', // GoToSocial
  require('pl-fe/assets/images/avatar-missing.png'), // avatar not provided by backend
];

/** Check if the avatar is a default avatar */
const isDefaultAvatar = (url: string) => DEFAULT_AVATARS.some(avatar => url.endsWith(avatar));

export {
  getDomain,
  getBaseURL,
  getAcct,
  isDefaultHeader,
  isDefaultAvatar,
};

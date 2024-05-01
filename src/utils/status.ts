import { isIntegerId } from 'soapbox/utils/numbers';

import type { IntlShape } from 'react-intl';
import type { Status } from 'soapbox/schemas';

/** Get the initial visibility of media attachments from user settings. */
export const defaultMediaVisibility = <T extends { reblog: T | string | null } & Pick<Status, 'visibility' | 'sensitive'>>(
  status: T | undefined | null,
  displayMedia: string,
): boolean => {
  if (!status) return false;
  status = getActualStatus(status);

  return (displayMedia !== 'hide_all' && !status.sensitive || displayMedia === 'show_all');
};

/** Grab the first external link from a status. */
export const getFirstExternalLink = (status: Pick<Status, 'content'>): HTMLAnchorElement | null => {
  try {
    // Pulled from Pleroma's media parser
    const selector = 'a:not(.mention,.hashtag,.attachment,[rel~="tag"])';
    const element = document.createElement('div');
    element.innerHTML = status.content;
    return element.querySelector(selector);
  } catch {
    return null;
  }
};

/** Whether the status is expected to have a Card after it loads. */
export const shouldHaveCard = (status: Pick<Status, 'content'>): boolean => {
  return Boolean(getFirstExternalLink(status));
};

/** Whether the media IDs on this status have integer IDs (opposed to FlakeIds). */
// https://gitlab.com/soapbox-pub/soapbox/-/merge_requests/1087
export const hasIntegerMediaIds = (status: Pick<Status, 'media_attachments'>): boolean => {
  return status.media_attachments.some(({ id }) => isIntegerId(id));
};

/** Sanitize status text for use with screen readers. */
export const textForScreenReader = (
  intl: IntlShape,
  status: Pick<Status, 'account' | 'spoiler_text' | 'hidden' | 'search_index' | 'created_at'>,
  rebloggedByText?: string,
): string => {
  const { account } = status;
  if (!account || typeof account !== 'object') return '';

  const displayName = account.display_name;

  const values = [
    displayName.length === 0 ? account.acct.split('@')[0] : displayName,
    status.spoiler_text && status.hidden ? status.spoiler_text : status.search_index.slice(status.spoiler_text.length),
    intl.formatDate(status.created_at, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    account.acct,
  ];

  if (rebloggedByText) {
    values.push(rebloggedByText);
  }

  return values.join(', ');
};

/** Get reblogged status if any, otherwise return the original status. */
export const getActualStatus = <T extends { reblog: T | string | null }>(status: T): T => {
  if (status?.reblog && typeof status?.reblog === 'object') {
    return status.reblog;
  } else {
    return status;
  }
};

export const getStatusIdsFromLinksInContent = (content: string): string[] => {
  const urls = content.match(RegExp(`${window.location.origin}/@([a-z\\d_-]+(?:@[^@\\s]+)?)/posts/[a-z0-9]+(?!\\S)`, 'gi'));

  if (!urls) return [];

  return Array.from(new Set(urls
    .map(url => url.split('/').at(-1) as string)
    .filter(url => url)));
};

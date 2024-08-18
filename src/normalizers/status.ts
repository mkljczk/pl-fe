/**
 * Status normalizer:
 * Converts API statuses into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/status/}
 */
import escapeTextContentForBrowser from 'escape-html';
import DOMPurify from 'isomorphic-dompurify';
import { type Account as BaseAccount, type Status as BaseStatus, type MediaAttachment, mentionSchema, type Translation } from 'pl-api';

import emojify from 'soapbox/features/emoji';
import { stripCompatibilityFeatures, unescapeHTML } from 'soapbox/utils/html';
import { makeEmojiMap } from 'soapbox/utils/normalizers';

import { normalizeAccount } from './account';
import { normalizeGroup } from './group';
import { normalizePoll } from './poll';

const domParser = new DOMParser();

type StatusApprovalStatus = Exclude<BaseStatus['approval_status'], null>;
type StatusVisibility = 'public' | 'unlisted' | 'private' | 'direct' | 'group' | 'mutuals_only' | 'local';

type CalculatedValues = {
  search_index: string;
  contentHtml: string;
  spoilerHtml: string;
  contentMapHtml?: Record<string, string>;
  spoilerMapHtml?: Record<string, string>;
  hidden?: boolean;
  translation?: Translation | null | false;
  currentLanguage?: string;
};

type OldStatus = Pick<BaseStatus, 'content' | 'spoiler_text'> & CalculatedValues;

// Gets titles of poll options from status
const getPollOptionTitles = ({ poll }: Pick<BaseStatus, 'poll'>): readonly string[] => {
  if (poll && typeof poll === 'object') {
    return poll.options.map(({ title }) => title);
  } else {
    return [];
  }
};

// Gets usernames of mentioned users from status
const getMentionedUsernames = (status: Pick<BaseStatus, 'mentions'>): Array<string> =>
  status.mentions.map(({ acct }) => `@${acct}`);

// Creates search text from the status
const buildSearchContent = (status: Pick<BaseStatus, 'poll' | 'mentions' | 'spoiler_text' | 'content'>): string => {
  const pollOptionTitles = getPollOptionTitles(status);
  const mentionedUsernames = getMentionedUsernames(status);

  const fields = [
    status.spoiler_text,
    status.content,
    ...pollOptionTitles,
    ...mentionedUsernames,
  ];

  return unescapeHTML(fields.join('\n\n')) || '';
};

const calculateContent = (text: string, emojiMap: any) => DOMPurify.sanitize(stripCompatibilityFeatures(emojify(text, emojiMap)), { USE_PROFILES: { html: true } });
const calculateSpoiler = (text: string, emojiMap: any) => DOMPurify.sanitize(emojify(escapeTextContentForBrowser(text), emojiMap), { USE_PROFILES: { html: true } });

const calculateStatus = (status: BaseStatus, oldStatus?: OldStatus): CalculatedValues => {
  if (oldStatus && oldStatus.content === status.content && oldStatus.spoiler_text === status.spoiler_text) {
    const {
      search_index, contentHtml, spoilerHtml, contentMapHtml, spoilerMapHtml, hidden, translation, currentLanguage,
    } = oldStatus;

    return {
      search_index, contentHtml, spoilerHtml, contentMapHtml, spoilerMapHtml, hidden, translation, currentLanguage,
    };
  } else {
    const searchContent = buildSearchContent(status);
    const emojiMap = makeEmojiMap(status.emojis);

    return {
      search_index: domParser.parseFromString(searchContent, 'text/html').documentElement.textContent || '',
      contentHtml: calculateContent(status.content, emojiMap),
      spoilerHtml: calculateSpoiler(status.spoiler_text, emojiMap),
      contentMapHtml: status.content_map
        ? Object.fromEntries(Object.entries(status.content_map)?.map(([key, value]) => [key, calculateContent(value, emojiMap)]))
        : undefined,
      spoilerMapHtml: status.spoiler_text_map
        ? Object.fromEntries(Object.entries(status.spoiler_text_map).map(([key, value]) => [key, calculateSpoiler(value, emojiMap)]))
        : undefined,
    };
  }
};

const normalizeStatus = (status: BaseStatus & {
  accounts?: Array<BaseAccount>;
}, oldStatus?: OldStatus) => {
  const calculated = calculateStatus(status, oldStatus);

  // Sort the replied-to mention to the top
  let mentions = status.mentions.toSorted((a, _b) => {
    if (a.id === status.in_reply_to_account_id) {
      return -1;
    } else {
      return 0;
    }
  });

  // Add self to mentions if it's a reply to self
  const isSelfReply = status.account.id === status.in_reply_to_account_id;
  const hasSelfMention = status.account.id === status.mentions[0]?.id;

  if (isSelfReply && !hasSelfMention) {
    const selfMention = mentionSchema.parse(status.account);
    mentions = [selfMention, ...mentions];
  }

  // If the status contains spoiler text, treat it as sensitive.
  const sensitive = !!status.spoiler_text || status.sensitive;

  // Normalize event
  let event: BaseStatus['event'] & ({
    banner: MediaAttachment | null;
    links: Array<MediaAttachment>;
  } | null) = null;
  let media_attachments = status.media_attachments;

  // Normalize poll
  const poll = status.poll ? normalizePoll(status.poll) : null;

  if (status.event) {
    const firstAttachment = status.media_attachments[0];
    let banner: MediaAttachment | null = null;

    if (firstAttachment?.description === 'Banner' && firstAttachment.type === 'image') {
      banner = firstAttachment;
      media_attachments = media_attachments.slice(1);
    }

    const links = media_attachments.filter(attachment => attachment.mime_type === 'text/html');
    media_attachments = media_attachments.filter(attachment => attachment.mime_type !== 'text/html');

    event = {
      ...status.event,
      banner,
      links,
    };
  }

  // Normalize group
  const group = status.group ? normalizeGroup(status.group) : null;

  return {
    account_id: status.account.id,
    reblog_id: status.reblog?.id || null,
    poll_id: status.poll?.id || null,
    quote_id: status.quote?.id || null,
    group_id: status.group?.id || null,
    translating: false,
    expectsCard: false,
    showFiltered: null as null | boolean,
    ...status,
    account: normalizeAccount(status.account),
    accounts: status.accounts?.map(normalizeAccount),
    mentions,
    sensitive,
    hidden: sensitive,
    /** Rewrite `<p></p>` to empty string. */
    content: status.content === '<p></p>' ? '' : status.content,
    filtered: status.filtered?.map(result => result.filter.title),
    event,
    poll,
    group,
    media_attachments,
    ...calculated,
    translation: (status.translation || calculated.translation || null) as Translation | null | false,
    // quote: status.quote ? normalizeStatus(status.quote as any) : null,
  };
};

type Status = ReturnType<typeof normalizeStatus>;

export {
  type StatusApprovalStatus,
  type StatusVisibility,
  normalizeStatus,
  type Status,
};

import type { PaginationParams } from './common';

interface CreateStatusWithContent {
  /** The text content of the status. If `media_ids` is provided, this becomes optional. Attaching a `poll` is optional while `status` is provided. */
  status: string;
  /** Array of String. Include Attachment IDs to be attached as media. If provided, `status` becomes optional, and `poll` cannot be used. */
  media_ids?: string[];
}

interface CreateStatusWithMedia {
  /** The text content of the status. If `media_ids` is provided, this becomes optional. Attaching a `poll` is optional while `status` is provided. */
  status?: string;
  /** Array of String. Include Attachment IDs to be attached as media. If provided, `status` becomes optional, and `poll` cannot be used. */
  media_ids: string[];
}

interface CreateStatusOptionalParams {
  poll?: {
    /** Array of String. Possible answers to the poll. If provided, `media_ids` cannot be used, and poll[expires_in] must be provided. */
    options: string[];
    /** Integer. Duration that the poll should be open, in seconds. If provided, media_ids cannot be used, and poll[options] must be provided. */
    expires_in: number;
    /** Boolean. Allow multiple choices? Defaults to false. */
    multiple?: boolean;
    /** Boolean. Hide vote counts until the poll ends? Defaults to false. */
    hide_totals?: boolean;

    options_map?: Array<Record<string, string>>;
  };
  /** String. ID of the status being replied to, if status is a reply. */
  in_reply_to_id?: string;
  /** Boolean. Mark status and attached media as sensitive? Defaults to false. */
  sensitive?: boolean;
  /** String. Text to be shown as a warning or subject before the actual content. Statuses are generally collapsed behind this field. */
  spoiler_text?: string;
  /**
   * String. Sets the visibility of the posted status to `public`, `unlisted`, `private`, `direct`.
   * `local` — requires `features.createStatusLocalScope`.
   * `list:LIST_ID` — requires `features.createStatusListScope`.
   */
  visibility?: string;
  /** String. ISO 639 language code for this status. */
  language?: string;
  /** String. ISO 8601 Datetime at which to schedule a status. Providing this parameter will cause ScheduledStatus to be returned instead of Status. Must be at least 5 minutes in the future. */
  scheduled_at?: string;

  /**
   * boolean, if set to true the post won't be actually posted, but the status entity would still be rendered back. This could be useful for previewing rich text/custom emoji, for example.
   * Requires `features.createStatusPreview`.
   */
  preview?: boolean;
  /**
   * string, contain the MIME type of the status, it is transformed into HTML by the backend. You can get the list of the supported MIME types with the `/api/v1/instance` endpoint.
   */
  content_type?: string;
  /**
   * A list of nicknames (like `lain@soykaf.club` or `lain` on the local server) that will be used to determine who is going to be addressed by this post. Using this will disable the implicit addressing by mentioned names in the `status` body, only the people in the `to` list will be addressed. The normal rules for post visibility are not affected by this and will still apply.
   * Requires `features.createStatusExplicitAddressing`.
  */
  to?: string[];
  /**
   * The number of seconds the posted activity should expire in. When a posted activity expires it will be deleted from the server, and a delete request for it will be federated. This needs to be longer than an hour.
   * Requires `features.createStatusExpiration`.
   */
  expires_in?: number;
  /**
   * Will reply to a given conversation, addressing only the people who are part of the recipient set of that conversation. Sets the visibility to `direct`.
   * Requires `features.createStatusReplyToConversation`.
   */
  in_reply_to_conversation_id?: string;
  /**
   * ID of the status being quoted, if any.
   * Requires `features.quotePosts`.
   */
  quote_id?: string;

  /**
   * If set to true, this status will be "local only" and will NOT be federated beyond the local timeline(s). If set to false (default), this status will be federated to your followers beyond the local timeline(s).
   */
  local_only?: boolean;

  group_id?: string;

  status_map?: Record<string, string>;
  spoiler_text_map?: Record<string, string>;
}

type CreateStatusParams = (CreateStatusWithContent | CreateStatusWithMedia) & CreateStatusOptionalParams;

interface LanguageParam {
  /** Attach translated version of a post. Requires `features.autoTranslate`. */
  language?: string;
}

type GetStatusParams = LanguageParam;

type GetStatusesParams = LanguageParam;

type GetStatusContextParams = LanguageParam;

type GetRebloggedByParams = Omit<PaginationParams, 'min_id'>

type GetFavouritedByParams = Omit<PaginationParams, 'min_id'>

interface EditStatusOptionalParams {
  sensitive?: boolean;
  spoiler_text?: string;
  language?: string;
}

type EditStatusParams = (CreateStatusWithContent | CreateStatusWithMedia) & EditStatusOptionalParams;
type GetStatusQuotesParams = PaginationParams;

export type {
  CreateStatusParams,
  GetStatusParams,
  GetStatusesParams,
  GetStatusContextParams,
  GetRebloggedByParams,
  GetFavouritedByParams,
  EditStatusParams,
  GetStatusQuotesParams,
};


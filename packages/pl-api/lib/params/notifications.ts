import type { PaginationParams } from './common';

interface GetNotificationParams extends PaginationParams {
  /** Array of String. Types to include in the result. */
  types?: string[];
  /** Array of String. Types to exclude from the results. */
  exclude_types?: string[];
  /** String. Return only notifications received from the specified account. */
  account_id?: string;
  /**
   * will exclude the notifications for activities with the given visibilities. The parameter accepts an array of visibility types (`public`, `unlisted`, `private`, `direct`).
   * Requires `features.notificationsExcludeVisibilities`.
   */
  exclude_visibilities?: string[];
}

interface UpdateNotificationPolicyRequest {
  /** Boolean. Whether to filter notifications from accounts the user is not following. */
  filter_not_following?: boolean;
  /** Boolean. Whether to filter notifications from accounts that are not following the user. */
  filter_not_followers?: boolean;
  /** Boolean. Whether to filter notifications from accounts created in the past 30 days. */
  filter_new_accounts?: boolean;
  /** Boolean. Whether to filter notifications from private mentions. Replies to private mentions initiated by the user, as well as accounts the user follows, are never filtered. */
  filter_private_mentions?: boolean;
}

type GetNotificationRequestsParams = PaginationParams;

export type {
  GetNotificationParams,
  UpdateNotificationPolicyRequest,
  GetNotificationRequestsParams,
};

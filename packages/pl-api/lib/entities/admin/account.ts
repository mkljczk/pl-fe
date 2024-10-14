import * as v from 'valibot';

import { accountSchema } from '../account';
import { roleSchema } from '../role';
import { dateSchema, filteredArray } from '../utils';

import { adminIpSchema } from './ip';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Account/} */
const adminAccountSchema = z.preprocess((account: any) => {
  if (!account.account) {
    /**
     * Convert Pleroma account schema
     * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminusers}
     */
    return {
      id: account.id,
      account: null,
      username: account.nickname,
      domain: account.nickname.split('@')[1] || null,
      created_at: account.created_at,
      email: account.email,
      invite_request: account.registration_reason,
      role: account.roles?.is_admin
        ? roleSchema.parse({ name: 'Admin' })
        : account.roles?.moderator
          ? roleSchema.parse({ name: 'Moderator ' }) :
          null,
      confirmed: account.is_confirmed,
      approved: account.is_approved,
      disabled: !account.is_active,

      actor_type: account.actor_type,
      display_name: account.display_name,
      suggested: account.is_suggested,
    };
  }
  return account;
}, v.object({
  id: v.string(),
  username: v.string(),
  domain: v.fallback(v.nullable(v.string()), null),
  created_at: dateSchema,
  email: v.fallback(v.nullable(v.string()), null),
  ip: v.fallback(v.nullable(z.string().ip()), null),
  ips: filteredArray(adminIpSchema),
  locale: v.fallback(v.nullable(v.string()), null),
  invite_request: v.fallback(v.nullable(v.string()), null),
  role: v.fallback(v.nullable(roleSchema), null),
  confirmed: v.fallback(v.boolean(), false),
  approved: v.fallback(v.boolean(), false),
  disabled: v.fallback(v.boolean(), false),
  silenced: v.fallback(v.boolean(), false),
  suspended: v.fallback(v.boolean(), false),
  account: v.fallback(v.nullable(accountSchema), null),
  created_by_application_id: v.fallback(v.optional(v.string()), undefined),
  invited_by_account_id: v.fallback(v.optional(v.string()), undefined),

  actor_type: v.fallback(v.nullable(v.string()), null),
  display_name: v.fallback(v.nullable(v.string()), null),
  suggested: v.fallback(v.nullable(v.boolean()), null),
}));

type AdminAccount = v.InferOutput<typeof adminAccountSchema>;

export {
  adminAccountSchema,
  type AdminAccount,
};

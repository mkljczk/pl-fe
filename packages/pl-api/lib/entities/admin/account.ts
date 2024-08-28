import { z } from 'zod';

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
}, z.object({
  id: z.string(),
  username: z.string(),
  domain: z.string().nullable().catch(null),
  created_at: dateSchema,
  email: z.string().nullable().catch(null),
  ip: z.string().ip().nullable().catch(null),
  ips: filteredArray(adminIpSchema),
  locale: z.string().nullable().catch(null),
  invite_request: z.string().nullable().catch(null),
  role: roleSchema.nullable().catch(null),
  confirmed: z.boolean().catch(false),
  approved: z.boolean().catch(false),
  disabled: z.boolean().catch(false),
  silenced: z.boolean().catch(false),
  suspended: z.boolean().catch(false),
  account: accountSchema.nullable().catch(null),
  created_by_application_id: z.string().optional().catch(undefined),
  invited_by_account_id: z.string().optional().catch(undefined),

  actor_type: z.string().nullable().catch(null),
  display_name: z.string().nullable().catch(null),
  suggested: z.boolean().nullable().catch(null),
}));

type AdminAccount = z.infer<typeof adminAccountSchema>;

export {
  adminAccountSchema,
  type AdminAccount,
};

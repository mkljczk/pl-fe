import type { Status } from '../normalizers/normalizeStatus';

const minifyStatus = ({ reblog, poll, quote, group, account, accounts, ...status }: Status) => ({
  ...status,
  reblog_id: reblog?.id || null,
  poll_id: poll?.id || null,
  quote_id: quote?.id || null,
  group_id: group?.id || null,
  account_id: account.id || null,
  account_ids: accounts?.map(account => account.id) || [account.id],
});

type MinifiedStatus = ReturnType<typeof minifyStatus>;

export { minifyStatus, type MinifiedStatus };

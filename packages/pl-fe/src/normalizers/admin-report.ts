import type { AdminReport as BaseAdminReport } from 'pl-api';

const normalizeAdminReport = (report: BaseAdminReport) => ({
  ...report,
  account_id: report.account?.id || null,
  target_account_id: report.target_account?.id || null,
  action_taken_by_account_id: report.action_taken_by_account?.id || null,
  assigned_account_id: report.assigned_account?.id || null,
  status_ids: report.statuses.map((status) => status.id),
});

type AdminReport = ReturnType<typeof normalizeAdminReport>;

export { normalizeAdminReport, type AdminReport };

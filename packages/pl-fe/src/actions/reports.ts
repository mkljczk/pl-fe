import { getClient } from '../api';

import { openModal } from './modals';

import type { Account, Status } from 'soapbox/normalizers';
import type { AppDispatch, RootState } from 'soapbox/store';

const REPORT_INIT = 'REPORT_INIT' as const;
const REPORT_CANCEL = 'REPORT_CANCEL' as const;

const REPORT_SUBMIT_REQUEST = 'REPORT_SUBMIT_REQUEST' as const;
const REPORT_SUBMIT_SUCCESS = 'REPORT_SUBMIT_SUCCESS' as const;
const REPORT_SUBMIT_FAIL = 'REPORT_SUBMIT_FAIL' as const;

const REPORT_STATUS_TOGGLE = 'REPORT_STATUS_TOGGLE' as const;
const REPORT_COMMENT_CHANGE = 'REPORT_COMMENT_CHANGE' as const;
const REPORT_FORWARD_CHANGE = 'REPORT_FORWARD_CHANGE' as const;
const REPORT_BLOCK_CHANGE = 'REPORT_BLOCK_CHANGE' as const;

const REPORT_RULE_CHANGE = 'REPORT_RULE_CHANGE' as const;

enum ReportableEntities {
  ACCOUNT = 'ACCOUNT',
  STATUS = 'STATUS'
}

type ReportedEntity = {
  status?: Pick<Status, 'id' | 'reblog_id'>;
}

const initReport = (entityType: ReportableEntities, account: Pick<Account, 'id'>, entities?: ReportedEntity) => (dispatch: AppDispatch) => {
  const { status } = entities || {};

  dispatch({
    type: REPORT_INIT,
    entityType,
    account,
    status,
  });

  return dispatch(openModal('REPORT'));
};

const cancelReport = () => ({
  type: REPORT_CANCEL,
});

const toggleStatusReport = (statusId: string, checked: boolean) => ({
  type: REPORT_STATUS_TOGGLE,
  statusId,
  checked,
});

const submitReport = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(submitReportRequest());
    const { reports } = getState();

    return getClient(getState()).accounts.reportAccount(reports.new.account_id!, {
      status_ids: reports.new.status_ids.toArray(),
      rule_ids: reports.new.rule_ids.toArray(),
      comment: reports.new.comment,
      forward: reports.new.forward,
    });
  };

const submitReportRequest = () => ({
  type: REPORT_SUBMIT_REQUEST,
});

const submitReportSuccess = () => ({
  type: REPORT_SUBMIT_SUCCESS,
});

const submitReportFail = (error: unknown) => ({
  type: REPORT_SUBMIT_FAIL,
  error,
});

const changeReportComment = (comment: string) => ({
  type: REPORT_COMMENT_CHANGE,
  comment,
});

const changeReportForward = (forward: boolean) => ({
  type: REPORT_FORWARD_CHANGE,
  forward,
});

const changeReportBlock = (block: boolean) => ({
  type: REPORT_BLOCK_CHANGE,
  block,
});

const changeReportRule = (ruleId: string) => ({
  type: REPORT_RULE_CHANGE,
  rule_id: ruleId,
});

export {
  ReportableEntities,
  REPORT_INIT,
  REPORT_CANCEL,
  REPORT_SUBMIT_REQUEST,
  REPORT_SUBMIT_SUCCESS,
  REPORT_SUBMIT_FAIL,
  REPORT_STATUS_TOGGLE,
  REPORT_COMMENT_CHANGE,
  REPORT_FORWARD_CHANGE,
  REPORT_BLOCK_CHANGE,
  REPORT_RULE_CHANGE,
  initReport,
  cancelReport,
  toggleStatusReport,
  submitReport,
  submitReportRequest,
  submitReportSuccess,
  submitReportFail,
  changeReportComment,
  changeReportForward,
  changeReportBlock,
  changeReportRule,
};

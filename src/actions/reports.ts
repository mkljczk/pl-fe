import { getClient } from '../api';

import { openModal } from './modals';

import type { Account } from 'soapbox/schemas';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { ChatMessage, Group, Status } from 'soapbox/types/entities';

const REPORT_INIT   = 'REPORT_INIT';
const REPORT_CANCEL = 'REPORT_CANCEL';

const REPORT_SUBMIT_REQUEST = 'REPORT_SUBMIT_REQUEST';
const REPORT_SUBMIT_SUCCESS = 'REPORT_SUBMIT_SUCCESS';
const REPORT_SUBMIT_FAIL    = 'REPORT_SUBMIT_FAIL';

const REPORT_STATUS_TOGGLE  = 'REPORT_STATUS_TOGGLE';
const REPORT_COMMENT_CHANGE = 'REPORT_COMMENT_CHANGE';
const REPORT_FORWARD_CHANGE = 'REPORT_FORWARD_CHANGE';
const REPORT_BLOCK_CHANGE   = 'REPORT_BLOCK_CHANGE';

const REPORT_RULE_CHANGE    = 'REPORT_RULE_CHANGE';

enum ReportableEntities {
  ACCOUNT = 'ACCOUNT',
  STATUS = 'STATUS'
}

type ReportedEntity = {
  status?: Status;
  chatMessage?: ChatMessage;
  group?: Group;
}

const initReport = (entityType: ReportableEntities, account: Account, entities?: ReportedEntity) => (dispatch: AppDispatch) => {
  const { status, chatMessage, group } = entities || {};

  dispatch({
    type: REPORT_INIT,
    entityType,
    account,
    status,
    chatMessage,
    group,
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
      // group_id: reports.getIn(['new', 'group', 'id']),
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

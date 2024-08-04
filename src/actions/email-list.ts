import { getClient } from '../api';

import type { RootState } from 'soapbox/store';

const getSubscribersCsv = () =>
  (dispatch: any, getState: () => RootState) =>
    getClient(getState).request('/api/v1/pleroma/admin/email_list/subscribers.csv', { contentType: '' });

const getUnsubscribersCsv = () =>
  (dispatch: any, getState: () => RootState) =>
    getClient(getState).request('/api/v1/pleroma/admin/email_list/unsubscribers.csv', { contentType: '' });

const getCombinedCsv = () =>
  (dispatch: any, getState: () => RootState) =>
    getClient(getState).request('/api/v1/pleroma/admin/email_list/combined.csv', { contentType: '' });

export {
  getSubscribersCsv,
  getUnsubscribersCsv,
  getCombinedCsv,
};

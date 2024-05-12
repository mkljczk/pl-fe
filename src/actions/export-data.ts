import { defineMessages } from 'react-intl';

import api, { getLinks } from 'soapbox/api';
import { normalizeAccount } from 'soapbox/normalizers';
import toast from 'soapbox/toast';

import type { RootState } from 'soapbox/store';

const EXPORT_FOLLOWS_REQUEST = 'EXPORT_FOLLOWS_REQUEST';
const EXPORT_FOLLOWS_SUCCESS = 'EXPORT_FOLLOWS_SUCCESS';
const EXPORT_FOLLOWS_FAIL    = 'EXPORT_FOLLOWS_FAIL';

const EXPORT_BLOCKS_REQUEST = 'EXPORT_BLOCKS_REQUEST';
const EXPORT_BLOCKS_SUCCESS = 'EXPORT_BLOCKS_SUCCESS';
const EXPORT_BLOCKS_FAIL    = 'EXPORT_BLOCKS_FAIL';

const EXPORT_MUTES_REQUEST = 'EXPORT_MUTES_REQUEST';
const EXPORT_MUTES_SUCCESS = 'EXPORT_MUTES_SUCCESS';
const EXPORT_MUTES_FAIL    = 'EXPORT_MUTES_FAIL';

const messages = defineMessages({
  blocksSuccess: { id: 'export_data.success.blocks', defaultMessage: 'Blocks exported successfully' },
  followersSuccess: { id: 'export_data.success.followers', defaultMessage: 'Followers exported successfully' },
  mutesSuccess: { id: 'export_data.success.mutes', defaultMessage: 'Mutes exported successfully' },
});

type ExportDataActions = {
  type: typeof EXPORT_FOLLOWS_REQUEST
  | typeof EXPORT_FOLLOWS_SUCCESS
  | typeof EXPORT_FOLLOWS_FAIL
  | typeof EXPORT_BLOCKS_REQUEST
  | typeof EXPORT_BLOCKS_SUCCESS
  | typeof EXPORT_BLOCKS_FAIL
  | typeof EXPORT_MUTES_REQUEST
  | typeof EXPORT_MUTES_SUCCESS
  | typeof EXPORT_MUTES_FAIL;
  error?: any;
}

const fileExport = (content: string, fileName: string) => {
  const fileToDownload = document.createElement('a');

  fileToDownload.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
  fileToDownload.setAttribute('download', fileName);
  fileToDownload.style.display = 'none';
  document.body.appendChild(fileToDownload);
  fileToDownload.click();
  document.body.removeChild(fileToDownload);
};

const listAccounts = (getState: () => RootState) => async(apiResponse: Response & { json: any }) => {
  const followings = apiResponse.json;
  let accounts = [];
  let next = getLinks(apiResponse).refs.find(link => link.rel === 'next');
  while (next) {
    apiResponse = await api(getState)(next.uri);
    next = getLinks(apiResponse).refs.find(link => link.rel === 'next');
    Array.prototype.push.apply(followings, apiResponse.json);
  }

  accounts = followings.map((account: any) => normalizeAccount(account).fqn);
  return Array.from(new Set(accounts));
};

const exportFollows = () => (dispatch: React.Dispatch<ExportDataActions>, getState: () => RootState) => {
  dispatch({ type: EXPORT_FOLLOWS_REQUEST });
  const me = getState().me;
  return api(getState)(`/api/v1/accounts/${me}/following?limit=40`)
    .then(listAccounts(getState))
    .then((followings) => {
      followings = followings.map(fqn => fqn + ',true');
      followings.unshift('Account address,Show boosts');
      fileExport(followings.join('\n'), 'export_followings.csv');

      toast.success(messages.followersSuccess);
      dispatch({ type: EXPORT_FOLLOWS_SUCCESS });
    }).catch(error => {
      dispatch({ type: EXPORT_FOLLOWS_FAIL, error });
    });
};

const exportBlocks = () => (dispatch: React.Dispatch<ExportDataActions>, getState: () => RootState) => {
  dispatch({ type: EXPORT_BLOCKS_REQUEST });
  return api(getState)('/api/v1/blocks?limit=40')
    .then(listAccounts(getState))
    .then((blocks) => {
      fileExport(blocks.join('\n'), 'export_block.csv');

      toast.success(messages.blocksSuccess);
      dispatch({ type: EXPORT_BLOCKS_SUCCESS });
    }).catch(error => {
      dispatch({ type: EXPORT_BLOCKS_FAIL, error });
    });
};

const exportMutes = () => (dispatch: React.Dispatch<ExportDataActions>, getState: () => RootState) => {
  dispatch({ type: EXPORT_MUTES_REQUEST });
  return api(getState)('/api/v1/mutes?limit=40')
    .then(listAccounts(getState))
    .then((mutes) => {
      fileExport(mutes.join('\n'), 'export_mutes.csv');

      toast.success(messages.mutesSuccess);
      dispatch({ type: EXPORT_MUTES_SUCCESS });
    }).catch(error => {
      dispatch({ type: EXPORT_MUTES_FAIL, error });
    });
};

export {
  EXPORT_FOLLOWS_REQUEST,
  EXPORT_FOLLOWS_SUCCESS,
  EXPORT_FOLLOWS_FAIL,
  EXPORT_BLOCKS_REQUEST,
  EXPORT_BLOCKS_SUCCESS,
  EXPORT_BLOCKS_FAIL,
  EXPORT_MUTES_REQUEST,
  EXPORT_MUTES_SUCCESS,
  EXPORT_MUTES_FAIL,
  exportFollows,
  exportBlocks,
  exportMutes,
};

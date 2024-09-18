import { Map as ImmutableMap } from 'immutable';

import {
  BACKUPS_CREATE_SUCCESS,
  BACKUPS_FETCH_SUCCESS,
} from '../actions/backups';

import type { Backup } from 'pl-api';
import type { AnyAction } from 'redux';

type State = ImmutableMap<string, Backup>;

const initialState: State = ImmutableMap();

const importBackup = (state: State, backup: Backup) =>
  state.set(backup.inserted_at, backup);

const importBackups = (state: State, backups: Array<Backup>) =>
  state.withMutations((mutable) => {
    backups.forEach((backup) => importBackup(mutable, backup));
  });

const backups = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case BACKUPS_FETCH_SUCCESS:
    case BACKUPS_CREATE_SUCCESS:
      return importBackups(state, action.backups);
    default:
      return state;
  }
};

export { backups as default };

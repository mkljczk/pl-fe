import { getClient } from 'pl-fe/api';
import { importEntities } from 'pl-fe/entity-store/actions';
import { Entities } from 'pl-fe/entity-store/entities';

import type { RootState } from 'pl-fe/store';
import type { AnyAction } from 'redux';

const submitAccountNote = (accountId: string, value: string) =>
  (dispatch: React.Dispatch<AnyAction>, getState: () => RootState) =>
    getClient(getState).accounts.updateAccountNote(accountId, value)
      .then(response => dispatch(importEntities([response], Entities.RELATIONSHIPS)));

export { submitAccountNote };

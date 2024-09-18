import {
  Map as ImmutableMap,
  OrderedSet as ImmutableOrderedSet,
  Record as ImmutableRecord,
} from 'immutable';

import { STATUSES_IMPORT, STATUS_IMPORT } from 'pl-fe/actions/importer';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
} from '../actions/accounts';
import {
  CONTEXT_FETCH_SUCCESS,
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
} from '../actions/statuses';
import { TIMELINE_DELETE } from '../actions/timelines';

import type { Status } from 'pl-api';
import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  inReplyTos: ImmutableMap<string, string>(),
  replies: ImmutableMap<string, ImmutableOrderedSet<string>>(),
});

type State = ReturnType<typeof ReducerRecord>;

/** Import a single status into the reducer, setting replies and replyTos. */
const importStatus = (
  state: State,
  status: Pick<Status, 'id' | 'in_reply_to_id'>,
  idempotencyKey?: string,
): State => {
  const { id, in_reply_to_id: inReplyToId } = status;
  if (!inReplyToId) return state;

  return state.withMutations((state) => {
    const replies = state.replies.get(inReplyToId) || ImmutableOrderedSet();
    const newReplies = replies.add(id).sort();

    state.setIn(['replies', inReplyToId], newReplies);
    state.setIn(['inReplyTos', id], inReplyToId);

    if (idempotencyKey) {
      deletePendingStatus(state, status, idempotencyKey);
    }
  });
};

/** Import multiple statuses into the state. */
const importStatuses = (
  state: State,
  statuses: Array<Pick<Status, 'id' | 'in_reply_to_id'>>,
): State =>
  state.withMutations((state) => {
    statuses.forEach((status) => importStatus(state, status));
  });

/** Insert a fake status ID connecting descendant to ancestor. */
const insertTombstone = (
  state: State,
  ancestorId: string,
  descendantId: string,
): State => {
  const tombstoneId = `${descendantId}-tombstone`;
  return state.withMutations((state) => {
    importStatus(state, { id: tombstoneId, in_reply_to_id: ancestorId });
    importStatus(state, { id: descendantId, in_reply_to_id: tombstoneId });
  });
};

/** Find the highest level status from this statusId. */
const getRootNode = (
  state: State,
  statusId: string,
  initialId = statusId,
): string => {
  const parent = state.inReplyTos.get(statusId);

  if (!parent) {
    return statusId;
  } else if (parent === initialId) {
    // Prevent cycles
    return parent;
  } else {
    return getRootNode(state, parent, initialId);
  }
};

/** Route fromId to toId by inserting tombstones. */
const connectNodes = (state: State, fromId: string, toId: string): State => {
  const fromRoot = getRootNode(state, fromId);
  const toRoot = getRootNode(state, toId);

  if (fromRoot !== toRoot) {
    return insertTombstone(state, toId, fromId);
  } else {
    return state;
  }
};

/** Import a branch of ancestors or descendants, in relation to statusId. */
const importBranch = (
  state: State,
  statuses: Array<Pick<Status, 'id' | 'in_reply_to_id'>>,
  statusId?: string,
): State =>
  state.withMutations((state) => {
    statuses.forEach((status, i) => {
      const prevId =
        statusId && i === 0 ? statusId : (statuses[i - 1] || {}).id;

      if (status.in_reply_to_id) {
        importStatus(state, status);

        // On Mastodon, in_reply_to_id can refer to an unavailable status,
        // so traverse the tree up and insert a connecting tombstone if needed.
        if (statusId) {
          connectNodes(state, status.id, statusId);
        }
      } else if (prevId) {
        // On Pleroma, in_reply_to_id will be null if the parent is unavailable,
        // so insert the tombstone now.
        insertTombstone(state, prevId, status.id);
      }
    });
  });

/** Import a status's ancestors and descendants. */
const normalizeContext = (
  state: State,
  id: string,
  ancestors: Array<Pick<Status, 'id' | 'in_reply_to_id'>>,
  descendants: Array<Pick<Status, 'id' | 'in_reply_to_id'>>,
) =>
  state.withMutations((state) => {
    importBranch(state, ancestors);
    importBranch(state, descendants, id);

    if (ancestors.length > 0 && !state.getIn(['inReplyTos', id])) {
      insertTombstone(state, ancestors[ancestors.length - 1].id, id);
    }
  });

/** Remove a status from the reducer. */
const deleteStatus = (state: State, statusId: string): State =>
  state.withMutations((state) => {
    // Delete from its parent's tree
    const parentId = state.inReplyTos.get(statusId);
    if (parentId) {
      const parentReplies =
        state.replies.get(parentId) || ImmutableOrderedSet();
      const newParentReplies = parentReplies.delete(statusId);
      state.setIn(['replies', parentId], newParentReplies);
    }

    // Dereference children
    const replies = state.replies.get(statusId) || ImmutableOrderedSet();
    replies.forEach((reply) => state.deleteIn(['inReplyTos', reply]));

    state.deleteIn(['inReplyTos', statusId]);
    state.deleteIn(['replies', statusId]);
  });

/** Delete multiple statuses from the reducer. */
const deleteStatuses = (state: State, statusIds: string[]): State =>
  state.withMutations((state) => {
    statusIds.forEach((statusId) => deleteStatus(state, statusId));
  });

/** Delete statuses upon blocking or muting a user. */
const filterContexts = (
  state: State,
  relationship: { id: string },
  /** The entire statuses map from the store. */
  statuses: ImmutableMap<string, Status>,
): State => {
  const ownedStatusIds = statuses
    .filter((status) => status.account.id === relationship.id)
    .map((status) => status.id)
    .toList()
    .toArray();

  return deleteStatuses(state, ownedStatusIds);
};

/** Add a fake status ID for a pending status. */
const importPendingStatus = (
  state: State,
  params: Pick<Status, 'id' | 'in_reply_to_id'>,
  idempotencyKey: string,
): State => {
  const id = `末pending-${idempotencyKey}`;
  const { in_reply_to_id } = params;
  return importStatus(state, { id, in_reply_to_id });
};

/** Delete a pending status from the reducer. */
const deletePendingStatus = (
  state: State,
  params: Pick<Status, 'id' | 'in_reply_to_id'>,
  idempotencyKey: string,
): State => {
  const id = `末pending-${idempotencyKey}`;
  const { in_reply_to_id: inReplyToId } = params;

  return state.withMutations((state) => {
    state.deleteIn(['inReplyTos', id]);

    if (inReplyToId) {
      const replies = state.replies.get(inReplyToId) || ImmutableOrderedSet();
      const newReplies = replies.delete(id).sort();
      state.setIn(['replies', inReplyToId], newReplies);
    }
  });
};

/** Contexts reducer. Used for building a nested tree structure for threads. */
const replies = (state = ReducerRecord(), action: AnyAction) => {
  switch (action.type) {
    case ACCOUNT_BLOCK_SUCCESS:
    case ACCOUNT_MUTE_SUCCESS:
      return filterContexts(state, action.relationship, action.statuses);
    case CONTEXT_FETCH_SUCCESS:
      return normalizeContext(
        state,
        action.statusId,
        action.ancestors,
        action.descendants,
      );
    case TIMELINE_DELETE:
      return deleteStatuses(state, [action.statusId]);
    case STATUS_CREATE_REQUEST:
      return importPendingStatus(state, action.params, action.idempotencyKey);
    case STATUS_CREATE_SUCCESS:
      return deletePendingStatus(state, action.status, action.idempotencyKey);
    case STATUS_IMPORT:
      return importStatus(state, action.status, action.idempotencyKey);
    case STATUSES_IMPORT:
      return importStatuses(state, action.statuses);
    default:
      return state;
  }
};

export { ReducerRecord, replies as default };

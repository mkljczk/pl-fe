import { Record as ImmutableRecord } from 'immutable';

import {
  PROFILE_HOVER_CARD_OPEN,
  PROFILE_HOVER_CARD_CLOSE,
  PROFILE_HOVER_CARD_UPDATE,
} from 'pl-fe/actions/profile-hover-card';

import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  ref: null as React.MutableRefObject<HTMLDivElement> | null,
  accountId: '',
  hovered: false,
});

type State = ReturnType<typeof ReducerRecord>;

const profileHoverCard = (state: State = ReducerRecord(), action: AnyAction) => {
  switch (action.type) {
    case PROFILE_HOVER_CARD_OPEN:
      return state.withMutations((state) => {
        state.set('ref', action.ref);
        state.set('accountId', action.accountId);
      });
    case PROFILE_HOVER_CARD_UPDATE:
      return state.set('hovered', true);
    case PROFILE_HOVER_CARD_CLOSE:
      if (state.get('hovered') === true && !action.force)
        return state;
      else
        return ReducerRecord();
    default:
      return state;
  }
};

export { profileHoverCard as default };

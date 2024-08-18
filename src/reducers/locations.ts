import { Map as ImmutableMap } from 'immutable';
import { Location } from 'pl-api';
import { AnyAction } from 'redux';

import { LOCATION_SEARCH_SUCCESS } from 'soapbox/actions/events';

type State = ImmutableMap<any, Location>;

const initialState: State = ImmutableMap();

const normalizeLocations = (state: State, locations: Array<Location>) =>
  locations.reduce(
    (state: State, location: Location) => state.set(location.origin_id, location),
    state,
  );

const locations = (state: State = initialState, action: AnyAction): State => {
  switch (action.type) {
    case LOCATION_SEARCH_SUCCESS:
      return normalizeLocations(state, action.locations);
    default:
      return state;
  }
};

export { locations as default };

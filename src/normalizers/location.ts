import { Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

const GeographicLocationRecord = ImmutableRecord({
  coordinates: null as [number, number] | null,
  srid: '',
});

const LocationRecord = ImmutableRecord({
  url: '',
  description: '',
  country: '',
  locality: '',
  region: '',
  postal_code: '',
  street: '',
  origin_id: '',
  origin_provider: '',
  type: '',
  timezone: '',
  geom: null as ReturnType<typeof GeographicLocationRecord> | null,
});

const normalizeGeographicLocation = (location: ImmutableMap<string, any>) => {
  if (location.get('geom')) {
    return location.set('geom', GeographicLocationRecord(location.get('geom')));
  }

  return location;
};

const normalizeLocation = (location: Record<string, any>) => LocationRecord(ImmutableMap(fromJS(location))
  .withMutations((location: ImmutableMap<string, any>) => {
    normalizeGeographicLocation(location);
  }));

export { GeographicLocationRecord, LocationRecord, normalizeLocation };

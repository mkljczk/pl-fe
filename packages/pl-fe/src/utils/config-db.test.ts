import { List as ImmutableList, fromJS } from 'immutable';

import config_db from 'pl-fe/__fixtures__/config_db.json';

import { ConfigDB } from './config-db';

test('find', () => {
  const configs = fromJS(config_db).get('configs');
  expect(ConfigDB.find(configs as ImmutableList<any>, ':phoenix', ':json_library')).toEqual(fromJS({
    group: ':phoenix',
    key: ':json_library',
    value: 'Jason',
  }));
});

import { useMemo } from 'react';

import { getSettings } from 'pl-fe/actions/settings';
import { settingsSchema } from 'pl-fe/schemas/pl-fe/settings';

import { useAppSelector } from './useAppSelector';

/** Get the user settings from the store */
const useSettings = () => {
  const data = useAppSelector((state) => getSettings(state));
  return useMemo(() => settingsSchema.parse(data.toJS()), [data]);
};

export { useSettings };

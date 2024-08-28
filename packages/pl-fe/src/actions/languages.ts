import { saveSettings } from './settings';

import type { AppDispatch } from 'pl-fe/store';

const LANGUAGE_USE = 'LANGUAGE_USE' as const;

const rememberLanguageUse = (language: string) => (dispatch: AppDispatch) => {
  dispatch({
    type: LANGUAGE_USE,
    language,
  });

  dispatch(saveSettings());
};

export { LANGUAGE_USE, rememberLanguageUse };

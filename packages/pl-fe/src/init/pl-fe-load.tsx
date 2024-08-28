import React, { useState, useEffect } from 'react';
import { IntlProvider } from 'react-intl';

import { fetchInstance } from 'pl-fe/actions/instance';
import { fetchMe } from 'pl-fe/actions/me';
import { loadPlFeConfig } from 'pl-fe/actions/pl-fe';
import LoadingScreen from 'pl-fe/components/loading-screen';
import {
  useAppSelector,
  useAppDispatch,
  useOwnAccount,
  useLocale,
} from 'pl-fe/hooks';
import MESSAGES from 'pl-fe/messages';

/** Load initial data from the backend */
const loadInitial = () => {
  // @ts-ignore
  return async(dispatch, getState) => {
    // Await for authenticated fetch
    await dispatch(fetchMe());
    // Await for feature detection
    await dispatch(fetchInstance());
    // Await for configuration
    await dispatch(loadPlFeConfig());
  };
};

interface IPlFeLoad {
  children: React.ReactNode;
}

/** Initial data loader. */
const PlFeLoad: React.FC<IPlFeLoad> = ({ children }) => {
  const dispatch = useAppDispatch();

  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const swUpdating = useAppSelector(state => state.meta.swUpdating);
  const { locale } = useLocale();

  const [messages, setMessages] = useState<Record<string, string>>({});
  const [localeLoading, setLocaleLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  /** Whether to display a loading indicator. */
  const showLoading = [
    me === null,
    me && !account,
    !isLoaded,
    localeLoading,
    swUpdating,
  ].some(Boolean);

  // Load the user's locale
  useEffect(() => {
    MESSAGES[locale]().then(messages => {
      setMessages(messages);
      setLocaleLoading(false);
    }).catch(() => { });
  }, [locale]);

  // Load initial data from the API
  useEffect(() => {
    dispatch(loadInitial()).then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, []);

  // intl is part of loading.
  // It's important nothing in here depends on intl.
  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export { PlFeLoad as default };

import { useEffect } from 'react';

const LOCAL_STORAGE_REDIRECT_KEY = 'plfe:redirect-uri';

const getRedirectUrl = () => {
  let redirectUri = localStorage.getItem(LOCAL_STORAGE_REDIRECT_KEY);
  if (redirectUri) {
    redirectUri = decodeURIComponent(redirectUri);
  }

  localStorage.removeItem(LOCAL_STORAGE_REDIRECT_KEY);
  return redirectUri || '/';
};

const useCachedLocationHandler = () => {
  const removeCachedRedirectUri = () =>
    localStorage.removeItem(LOCAL_STORAGE_REDIRECT_KEY);

  useEffect(() => {
    window.addEventListener('beforeunload', removeCachedRedirectUri);

    return () => {
      window.removeEventListener('beforeunload', removeCachedRedirectUri);
    };
  }, []);

  return null;
};

export { getRedirectUrl, useCachedLocationHandler };

import queryString from 'query-string';

// Adapted from Axios https://github.com/axios/axios/blob/v1.x/lib/core/buildFullPath.js
const isAbsoluteURL = (url: string) => /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);

const combineURLs = (baseURL: string, relativeURL: string) => relativeURL
  ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
  : baseURL;

const buildFullPath = (requestedURL: string, baseURL?: string, params?: Record<string, any>) => {
  const path = (baseURL && !isAbsoluteURL(requestedURL)) ? combineURLs(baseURL, requestedURL) : requestedURL;

  if (params) {
    return `${path}?${queryString.stringify(params, { arrayFormat: 'bracket' })}`;
  }
  return path;
};

export {
  isAbsoluteURL,
  combineURLs,
  buildFullPath,
};
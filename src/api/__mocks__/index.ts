import MockAdapter from 'axios-mock-adapter';
import LinkHeader from 'http-link-header';
import { vi } from 'vitest';

const api = await vi.importActual('../index') as Record<string, Function>;
let mocks: Array<Function> = [];

export const __stub = (func: (mock: MockAdapter) => void) => mocks.push(func);
export const __clear = (): Function[] => mocks = [];

// const setupMock = (axios: AxiosInstance) => {
//   const mock = new MockAdapter(axios, { onNoMatch: 'throwException' });
//   mocks.map(func => func(mock));
// };

export const staticClient = api.staticClient;

export const getLinks = (response: Response): LinkHeader => {
  return new LinkHeader(response.headers?.get('link') || undefined);
};

export const getNextLink = (response: Response) => {
  const nextLink = new LinkHeader(response.headers?.get('link') || undefined);
  return nextLink.refs.find(link => link.rel === 'next')?.uri;
};

export const getPrevLink = (response: Response) => {
  const prevLink = new LinkHeader(response.headers?.get('link') || undefined);
  return prevLink.refs.find(link => link.rel === 'prev')?.uri;
};

export const baseClient = (...params: any[]) => {
  const axios = api.baseClient(...params);
  // setupMock(axios);
  return axios;
};

export default (...params: any[]) => {
  const axios = api.default(...params);
  // setupMock(axios);
  return axios;
};

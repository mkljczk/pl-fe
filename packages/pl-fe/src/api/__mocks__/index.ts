// import MockAdapter from 'axios-mock-adapter';
import LinkHeader from 'http-link-header';
import { vi } from 'vitest';

const api = await vi.importActual('../index') as Record<string, Function>;
let mocks: Array<Function> = [];

const __stub = (func: (mock: any) => void) => mocks.push(func);
const __clear = (): Function[] => mocks = [];

// const setupMock = (axios: AxiosInstance) => {
//   const mock = new MockAdapter(axios, { onNoMatch: 'throwException' });
//   mocks.map(func => func(mock));
// };

const staticClient = api.staticClient;

const getLinks = (response: Response): LinkHeader =>
  new LinkHeader(response.headers?.get('link') || undefined);

const getNextLink = (response: Response) => {
  const nextLink = new LinkHeader(response.headers?.get('link') || undefined);
  return nextLink.refs.find(link => link.rel === 'next')?.uri;
};

const getPrevLink = (response: Response) => {
  const prevLink = new LinkHeader(response.headers?.get('link') || undefined);
  return prevLink.refs.find(link => link.rel === 'prev')?.uri;
};

const baseClient = (...params: any[]) => {
  const axios = api.baseClient(...params);
  // setupMock(axios);
  return axios;
};

export default (...params: any[]) => {
  const axios = api.default(...params);
  // setupMock(axios);
  return axios;
};

export { __stub, __clear, staticClient, getLinks, getNextLink, getPrevLink, baseClient };

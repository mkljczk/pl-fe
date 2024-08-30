import { directoryCategorySchema, directoryLanguageSchema, directoryServerSchema, directoryStatisticsPeriodSchema } from './entities';
import { filteredArray } from './entities/utils';
import request from './request';

interface Params {
  language?: string;
  category?: string;
  region?: 'europe' | 'north_america' | 'south_america' | 'africa' | 'asia' | 'oceania';
  ownership?: 'juridicial' | 'natural';
  registrations?: 'instant' | 'manual';
}

class PlApiDirectoryClient {

  accessToken = undefined;
  baseURL: string;
  public request = request.bind(this) as typeof request;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getStatistics() {
    const response = await this.request('/statistics');

    return filteredArray(directoryStatisticsPeriodSchema).parse(response.json);
  }

  async getCategories(params?: Params) {
    const response = await this.request('/categories', { params });

    return filteredArray(directoryCategorySchema).parse(response.json);
  }

  async getLanguages(params?: Params) {
    const response = await this.request('/categories', { params });

    return filteredArray(directoryLanguageSchema).parse(response.json);
  }

  async getServers(params?: Params) {
    const response = await this.request('/servers', { params });

    return filteredArray(directoryServerSchema).parse(response.json);
  }

}

export {
  PlApiDirectoryClient,
  PlApiDirectoryClient as default,
};

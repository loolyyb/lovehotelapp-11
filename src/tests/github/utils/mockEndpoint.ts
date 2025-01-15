import { EndpointInterface, RequestMethod, RequestParameters } from '@octokit/types';
import { vi } from 'vitest';

export interface MockEndpointOptions {
  method: RequestMethod;
  url: string;
  baseUrl?: string;
}

export function createMockEndpoint({ method, url, baseUrl = 'https://api.github.com' }: MockEndpointOptions): EndpointInterface<RequestParameters> {
  const endpoint = vi.fn() as unknown as EndpointInterface<RequestParameters>;
  
  endpoint.DEFAULTS = {
    baseUrl,
    headers: {
      accept: 'application/vnd.github.v3+json',
      'user-agent': 'octokit/rest.js'
    },
    mediaType: { format: '' },
    method,
    url
  };

  endpoint.defaults = vi.fn().mockImplementation((newDefaults) => createMockEndpoint({ method, url }));
  endpoint.merge = vi.fn();
  endpoint.parse = vi.fn();

  return endpoint;
}

export function createOctokitMock(mockResponse: any) {
  return vi.fn().mockReturnValue({
    data: mockResponse
  });
}
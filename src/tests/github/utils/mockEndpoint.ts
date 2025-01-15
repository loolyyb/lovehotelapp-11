import { EndpointInterface, RequestMethod, RequestParameters, RequestInterface } from '@octokit/types';
import { vi } from 'vitest';

export interface MockEndpointOptions {
  method: RequestMethod;
  url: string;
  baseUrl?: string;
}

interface EndpointDefaults extends RequestParameters {
  url: string;
}

export function createMockEndpoint({ method, url, baseUrl = 'https://api.github.com' }: MockEndpointOptions): EndpointInterface<EndpointDefaults> {
  const endpoint = vi.fn() as unknown as EndpointInterface<EndpointDefaults>;
  
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
  const mockFn = vi.fn().mockImplementation(() => {
    if (mockResponse instanceof Promise) {
      return mockResponse.then(data => ({ data }));
    }
    return { data: mockResponse };
  });

  return Object.assign(mockFn, {
    defaults: vi.fn().mockReturnValue(mockFn),
    endpoint: createMockEndpoint({ 
      method: 'GET', 
      url: '/mock' 
    })
  });
}
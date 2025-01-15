import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BranchService } from '@/services/github/BranchService';
import { GitHubConfig } from '@/services/github/types';
import { logger } from '@/services/LogService';
import { RequestMethod, EndpointInterface, RequestParameters } from '@octokit/types';

const createMockEndpoint = <T extends RequestParameters>(method: RequestMethod, url: string): EndpointInterface<T> => ({
  DEFAULTS: {
    baseUrl: 'https://api.github.com',
    headers: {
      accept: 'application/vnd.github.v3+json',
      'user-agent': 'octokit/rest.js'
    },
    mediaType: { format: '' },
    method,
    url
  },
  defaults: vi.fn((newDefaults: T) => createMockEndpoint<T>(method, url)),
  merge: vi.fn(),
  parse: vi.fn()
});

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    git: {
      getRef: Object.assign(
        vi.fn().mockReturnValue({
          data: {
            object: {
              sha: 'test-sha'
            }
          }
        }),
        {
          endpoint: createMockEndpoint<RequestParameters>('GET' as RequestMethod, '/repos/{owner}/{repo}/git/ref/{ref}'),
          defaults: vi.fn()
        }
      ),
      createRef: Object.assign(
        vi.fn().mockReturnValue({
          data: {
            ref: 'refs/heads/test-branch'
          }
        }),
        {
          endpoint: createMockEndpoint<RequestParameters>('POST' as RequestMethod, '/repos/{owner}/{repo}/git/refs'),
          defaults: vi.fn()
        }
      )
    }
  }))
}));

vi.mock('@/services/LogService', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('BranchService', () => {
  let branchService: BranchService;
  const config: GitHubConfig = {
    token: 'test-token',
    owner: 'test-owner',
    repo: 'test-repo'
  };

  beforeEach(() => {
    branchService = new BranchService(config);
    vi.clearAllMocks();
  });

  it('should successfully create a branch', async () => {
    const result = await branchService.createBranch('test-branch');

    expect(result.success).toBe(true);
    expect(branchService['octokit'].git.getRef).toHaveBeenCalledWith({
      owner: config.owner,
      repo: config.repo,
      ref: 'heads/main'
    });
    expect(branchService['octokit'].git.createRef).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle errors when creating a branch', async () => {
    const error = new Error('API Error');
    branchService['octokit'].git.getRef = Object.assign(
      vi.fn().mockRejectedValue(error),
      {
        endpoint: createMockEndpoint('GET' as RequestMethod, '/repos/{owner}/{repo}/git/ref/{ref}')
      }
    );

    const result = await branchService.createBranch('test-branch');

    expect(result.success).toBe(false);
    expect(result.error).toBe('API Error');
    expect(logger.error).toHaveBeenCalled();
  });
});
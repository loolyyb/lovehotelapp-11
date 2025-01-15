import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BranchService } from '@/services/github/BranchService';
import { GitHubConfig } from '@/services/github/types';
import { logger } from '@/services/LogService';
import { RequestMethod } from '@octokit/types';

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
          defaults: vi.fn(),
          endpoint: {
            DEFAULTS: {
              baseUrl: 'https://api.github.com',
              headers: {
                accept: 'application/vnd.github.v3+json',
                'user-agent': 'octokit/rest.js'
              },
              mediaType: { format: '' },
              method: 'GET' as RequestMethod,
              url: '/repos/{owner}/{repo}/git/ref/{ref}'
            },
            defaults: vi.fn((newDefaults) => ({
              ...mockEndpoint,
              DEFAULTS: { ...mockEndpoint.DEFAULTS, ...newDefaults }
            })),
            merge: vi.fn(),
            parse: vi.fn()
          }
        }
      ),
      createRef: Object.assign(
        vi.fn().mockReturnValue({
          data: {
            ref: 'refs/heads/test-branch'
          }
        }),
        {
          defaults: vi.fn(),
          endpoint: {
            DEFAULTS: {
              baseUrl: 'https://api.github.com',
              headers: {
                accept: 'application/vnd.github.v3+json',
                'user-agent': 'octokit/rest.js'
              },
              mediaType: { format: '' },
              method: 'POST' as RequestMethod,
              url: '/repos/{owner}/{repo}/git/refs'
            },
            defaults: vi.fn((newDefaults) => ({
              ...mockEndpoint,
              DEFAULTS: { ...mockEndpoint.DEFAULTS, ...newDefaults }
            })),
            merge: vi.fn(),
            parse: vi.fn()
          }
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

const mockEndpoint = {
  DEFAULTS: {
    baseUrl: 'https://api.github.com',
    headers: {
      accept: 'application/vnd.github.v3+json',
      'user-agent': 'octokit/rest.js'
    },
    mediaType: { format: '' },
    method: 'GET' as RequestMethod,
    url: '/repos/{owner}/{repo}/git/ref/{ref}'
  },
  defaults: vi.fn((newDefaults) => ({
    ...mockEndpoint,
    DEFAULTS: { ...mockEndpoint.DEFAULTS, ...newDefaults }
  })),
  merge: vi.fn(),
  parse: vi.fn()
};

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
        defaults: vi.fn(),
        endpoint: {
          DEFAULTS: {
            baseUrl: 'https://api.github.com',
            headers: {
              accept: 'application/vnd.github.v3+json',
              'user-agent': 'octokit/rest.js'
            },
            mediaType: { format: '' },
            method: 'GET' as RequestMethod,
            url: '/repos/{owner}/{repo}/git/ref/{ref}'
          },
          defaults: {},
          merge: vi.fn(),
          parse: vi.fn()
        }
      }
    );

    const result = await branchService.createBranch('test-branch');

    expect(result.success).toBe(false);
    expect(result.error).toBe('API Error');
    expect(logger.error).toHaveBeenCalled();
  });
});
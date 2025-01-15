import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileService } from '@/services/github/FileService';
import { GitHubConfig } from '@/services/github/types';
import { logger } from '@/services/LogService';
import { RequestMethod } from '@octokit/types';

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    repos: {
      getContent: Object.assign(
        vi.fn().mockReturnValue({
          data: {
            sha: 'test-sha'
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
              url: '/repos/{owner}/{repo}/contents/{path}'
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
      createOrUpdateFileContents: Object.assign(
        vi.fn().mockReturnValue({
          data: {
            content: {
              sha: 'new-sha'
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
              method: 'PUT' as RequestMethod,
              url: '/repos/{owner}/{repo}/contents/{path}'
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
    url: '/repos/{owner}/{repo}/contents/{path}'
  },
  defaults: vi.fn((newDefaults) => ({
    ...mockEndpoint,
    DEFAULTS: { ...mockEndpoint.DEFAULTS, ...newDefaults }
  })),
  merge: vi.fn(),
  parse: vi.fn()
};

describe('FileService', () => {
  let fileService: FileService;
  const config: GitHubConfig = {
    token: 'test-token',
    owner: 'test-owner',
    repo: 'test-repo'
  };

  beforeEach(() => {
    fileService = new FileService(config);
    vi.clearAllMocks();
  });

  it('should successfully update a file', async () => {
    const result = await fileService.updateFile(
      'test-branch',
      'test.ts',
      'test content',
      'test commit'
    );

    expect(result.success).toBe(true);
    expect(fileService['octokit'].repos.getContent).toHaveBeenCalled();
    expect(fileService['octokit'].repos.createOrUpdateFileContents).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle errors when updating a file', async () => {
    const error = new Error('File not found');
    fileService['octokit'].repos.getContent = Object.assign(
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
            url: '/repos/{owner}/{repo}/contents/{path}'
          },
          defaults: {},
          merge: vi.fn(),
          parse: vi.fn()
        }
      }
    );

    const result = await fileService.updateFile(
      'test-branch',
      'test.ts',
      'test content',
      'test commit'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('File not found');
    expect(logger.error).toHaveBeenCalled();
  });
});

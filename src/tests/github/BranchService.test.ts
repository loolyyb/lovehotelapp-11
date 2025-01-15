import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BranchService } from '@/services/github/BranchService';
import { GitHubConfig } from '@/services/github/types';
import { logger } from '@/services/LogService';
import { createMockEndpoint, createOctokitMock } from './utils/mockEndpoint';

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    git: {
      getRef: Object.assign(
        createOctokitMock({ object: { sha: 'test-sha' } }),
        {
          endpoint: createMockEndpoint({ method: 'GET', url: '/repos/{owner}/{repo}/git/ref/{ref}' })
        }
      ),
      createRef: Object.assign(
        createOctokitMock({ ref: 'refs/heads/test-branch' }),
        {
          endpoint: createMockEndpoint({ method: 'POST', url: '/repos/{owner}/{repo}/git/refs' })
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
        endpoint: createMockEndpoint({ method: 'GET', url: '/repos/{owner}/{repo}/git/ref/{ref}' })
      }
    );

    const result = await branchService.createBranch('test-branch');

    expect(result.success).toBe(false);
    expect(result.error).toBe('API Error');
    expect(logger.error).toHaveBeenCalled();
  });
});
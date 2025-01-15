import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PullRequestService } from '@/services/github/PullRequestService';
import { GitHubConfig } from '@/services/github/types';
import { logger } from '@/services/LogService';

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    pulls: {
      create: Object.assign(
        vi.fn().mockReturnValue({
          data: {
            html_url: 'https://github.com/test/pr/1'
          }
        }),
        {
          defaults: vi.fn(),
          endpoint: vi.fn()
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

describe('PullRequestService', () => {
  let prService: PullRequestService;
  const config: GitHubConfig = {
    token: 'test-token',
    owner: 'test-owner',
    repo: 'test-repo'
  };

  beforeEach(() => {
    prService = new PullRequestService(config);
    vi.clearAllMocks();
  });

  it('should successfully create a pull request', async () => {
    const result = await prService.createPullRequest(
      'test-branch',
      'Test PR',
      'Test description'
    );

    expect(result.url).toBe('https://github.com/test/pr/1');
    expect(prService['octokit'].pulls.create).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle errors when creating a pull request', async () => {
    const error = new Error('Branch not found');
    prService['octokit'].pulls.create = vi.fn().mockRejectedValue(error);

    const result = await prService.createPullRequest(
      'test-branch',
      'Test PR',
      'Test description'
    );

    expect(result.url).toBeNull();
    expect(result.error).toBe('Branch not found');
    expect(logger.error).toHaveBeenCalled();
  });
});
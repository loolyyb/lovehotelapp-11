import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileService } from '@/services/github/FileService';
import { GitHubConfig } from '@/services/github/types';
import { logger } from '@/services/LogService';

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
          endpoint: vi.fn()
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
    fileService['octokit'].repos.getContent = vi.fn().mockRejectedValue(error);

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
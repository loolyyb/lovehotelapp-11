import { describe, it, expect, vi } from 'vitest';
import { GitHubService } from '@/services/github/GitHubService';
import { BranchService } from '@/services/github/BranchService';
import { FileService } from '@/services/github/FileService';
import { PullRequestService } from '@/services/github/PullRequestService';

vi.mock('@/services/github/BranchService');
vi.mock('@/services/github/FileService');
vi.mock('@/services/github/PullRequestService');

describe('GitHubService', () => {
  const token = 'test-token';
  const owner = 'test-owner';
  const repo = 'test-repo';

  it('should initialize all services correctly', () => {
    const githubService = new GitHubService(token, owner, repo);
    
    expect(githubService['branchService']).toBeInstanceOf(BranchService);
    expect(githubService['fileService']).toBeInstanceOf(FileService);
    expect(githubService['pullRequestService']).toBeInstanceOf(PullRequestService);
  });

  it('should delegate createBranch to BranchService', async () => {
    const githubService = new GitHubService(token, owner, repo);
    const mockCreateBranch = vi.fn().mockResolvedValue({ success: true });
    
    githubService['branchService'].createBranch = mockCreateBranch;
    
    await githubService.createBranch('test-branch');
    
    expect(mockCreateBranch).toHaveBeenCalledWith('test-branch', 'main');
  });

  it('should delegate updateFile to FileService', async () => {
    const githubService = new GitHubService(token, owner, repo);
    const mockUpdateFile = vi.fn().mockResolvedValue({ success: true });
    
    githubService['fileService'].updateFile = mockUpdateFile;
    
    await githubService.updateFile('test-branch', 'test.ts', 'content', 'commit');
    
    expect(mockUpdateFile).toHaveBeenCalledWith('test-branch', 'test.ts', 'content', 'commit');
  });

  it('should delegate createPullRequest to PullRequestService', async () => {
    const githubService = new GitHubService(token, owner, repo);
    const mockCreatePR = vi.fn().mockResolvedValue({ url: 'https://github.com/test/pr/1' });
    
    githubService['pullRequestService'].createPullRequest = mockCreatePR;
    
    await githubService.createPullRequest('test-branch', 'Test PR', 'Description');
    
    expect(mockCreatePR).toHaveBeenCalledWith('test-branch', 'Test PR', 'Description', 'main');
  });
});
import { BranchService } from "./BranchService";
import { FileService } from "./FileService";
import { PullRequestService } from "./PullRequestService";
import { GitHubConfig } from "./types";

export class GitHubService {
  private branchService: BranchService;
  private fileService: FileService;
  private pullRequestService: PullRequestService;

  constructor(token: string, owner: string, repo: string) {
    const config: GitHubConfig = { token, owner, repo };
    this.branchService = new BranchService(config);
    this.fileService = new FileService(config);
    this.pullRequestService = new PullRequestService(config);
  }

  async createBranch(branchName: string, sourceBranch: string = 'main') {
    return this.branchService.createBranch(branchName, sourceBranch);
  }

  async updateFile(branchName: string, filePath: string, content: string, commitMessage: string) {
    return this.fileService.updateFile(branchName, filePath, content, commitMessage);
  }

  async createPullRequest(branchName: string, title: string, body: string, baseBranch: string = 'main') {
    return this.pullRequestService.createPullRequest(branchName, title, body, baseBranch);
  }
}

export * from "./types";
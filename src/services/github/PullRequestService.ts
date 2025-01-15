import { Octokit } from "@octokit/rest";
import { GitHubConfig, PullRequestResponse } from "./types";

export class PullRequestService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(config: GitHubConfig) {
    this.octokit = new Octokit({
      auth: config.token
    });
    this.owner = config.owner;
    this.repo = config.repo;
  }

  async createPullRequest(
    branchName: string, 
    title: string, 
    body: string, 
    baseBranch: string = 'main'
  ): Promise<PullRequestResponse> {
    try {
      const { data: pullRequest } = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        head: branchName,
        base: baseBranch
      });

      console.log(`Pull request created successfully: ${pullRequest.html_url}`);
      return { url: pullRequest.html_url };
    } catch (error) {
      console.error('Error creating pull request:', error);
      return { 
        url: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}
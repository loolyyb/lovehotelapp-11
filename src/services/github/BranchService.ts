import { Octokit } from "@octokit/rest";
import { GitHubConfig, BranchResponse } from "./types";

export class BranchService {
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

  async createBranch(branchName: string, sourceBranch: string = 'main'): Promise<BranchResponse> {
    try {
      // Get the SHA of the source branch
      const { data: sourceRef } = await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${sourceBranch}`
      });

      // Create new branch
      await this.octokit.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`,
        sha: sourceRef.object.sha
      });

      console.log(`Branch ${branchName} created successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error creating branch:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}
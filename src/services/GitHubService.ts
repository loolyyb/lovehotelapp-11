import { Octokit } from "@octokit/rest";

class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(token: string, owner: string, repo: string) {
    this.octokit = new Octokit({
      auth: token
    });
    this.owner = owner;
    this.repo = repo;
  }

  async createBranch(branchName: string, sourceBranch: string = 'main'): Promise<boolean> {
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
      return true;
    } catch (error) {
      console.error('Error creating branch:', error);
      return false;
    }
  }

  async updateFile(
    branchName: string, 
    filePath: string, 
    content: string, 
    commitMessage: string
  ): Promise<boolean> {
    try {
      // Get the current file to get its SHA
      const { data: currentFile } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        ref: branchName
      });

      if (!('sha' in currentFile)) {
        throw new Error('Invalid file data received');
      }

      // Update the file
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        sha: currentFile.sha,
        branch: branchName
      });

      console.log(`File ${filePath} updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating file:', error);
      return false;
    }
  }

  async createPullRequest(
    branchName: string, 
    title: string, 
    body: string, 
    baseBranch: string = 'main'
  ): Promise<string | null> {
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
      return pullRequest.html_url;
    } catch (error) {
      console.error('Error creating pull request:', error);
      return null;
    }
  }
}

export { GitHubService };
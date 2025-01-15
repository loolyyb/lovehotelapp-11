import { Octokit } from "@octokit/rest";
import { GitHubConfig, FileUpdateResponse } from "./types";

export class FileService {
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

  async updateFile(
    branchName: string, 
    filePath: string, 
    content: string, 
    commitMessage: string
  ): Promise<FileUpdateResponse> {
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
      return { success: true };
    } catch (error) {
      console.error('Error updating file:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}
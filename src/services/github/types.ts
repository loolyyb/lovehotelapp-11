export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface BranchResponse {
  success: boolean;
  error?: string;
}

export interface FileUpdateResponse {
  success: boolean;
  error?: string;
}

export interface PullRequestResponse {
  url: string | null;
  error?: string;
}
export interface Version {
  major: number;
  minor: number;
  patch: number;
}

export type VersionData = {
  version: string;
  current?: string;
  available?: string[];
};
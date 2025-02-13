
import { Version } from "@/types/version.types";

export function parseVersion(version: string): Version {
  const [major, minor, patch] = version.split(".").map(Number);
  return { major, minor, patch };
}

export function compareVersions(current: string, target: string): -1 | 0 | 1 {
  const currentVersion = parseVersion(current);
  const targetVersion = parseVersion(target);

  if (currentVersion.major !== targetVersion.major) {
    return currentVersion.major < targetVersion.major ? -1 : 1;
  }

  if (currentVersion.minor !== targetVersion.minor) {
    return currentVersion.minor < targetVersion.minor ? -1 : 1;
  }

  if (currentVersion.patch !== targetVersion.patch) {
    return currentVersion.patch < targetVersion.patch ? -1 : 1;
  }

  return 0;
}

export function needsUpdate(currentVersion: string, targetVersion: string): boolean {
  return compareVersions(currentVersion, targetVersion) === -1;
}

export function incrementVersion(version: string, isMajorUpdate: boolean = false): string {
  const versionObj = parseVersion(version);
  
  if (isMajorUpdate) {
    versionObj.minor += 1;
    versionObj.patch = 0;
  } else {
    versionObj.patch += 1;
  }
  
  return `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
}

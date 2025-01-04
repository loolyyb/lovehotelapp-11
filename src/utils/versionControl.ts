interface Version {
  major: number;
  minor: number;
  patch: number;
}

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

export async function checkForUpdates(currentVersion: string): Promise<{
  hasUpdate: boolean;
  targetVersion?: string;
}> {
  try {
    // This would be replaced with an actual API call to check for updates
    const response = await fetch("/api/version");
    const { version: targetVersion } = await response.json();
    
    return {
      hasUpdate: needsUpdate(currentVersion, targetVersion),
      targetVersion,
    };
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return { hasUpdate: false };
  }
}
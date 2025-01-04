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

export function incrementVersion(version: string): string {
  const versionObj = parseVersion(version);
  versionObj.minor += 0.1;
  // Arrondir à une décimale pour éviter les problèmes de précision des nombres flottants
  const newMinor = Math.round(versionObj.minor * 10) / 10;
  return `${versionObj.major}.${newMinor}.${versionObj.patch}`;
}

export async function getCurrentVersion(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'app_version')
      .single();

    if (error) throw error;
    return data?.value?.version || '1.0.0';
  } catch (error) {
    console.error('Error getting current version:', error);
    return '1.0.0';
  }
}

export async function updateVersion(): Promise<void> {
  try {
    const currentVersion = await getCurrentVersion();
    const newVersion = incrementVersion(currentVersion);

    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key: 'app_version',
        value: { version: newVersion },
      });

    if (error) throw error;
    console.log(`Version updated to ${newVersion}`);
  } catch (error) {
    console.error('Error updating version:', error);
  }
}

export async function checkForUpdates(currentVersion: string): Promise<{
  hasUpdate: boolean;
  targetVersion?: string;
}> {
  try {
    const latestVersion = await getCurrentVersion();
    return {
      hasUpdate: needsUpdate(currentVersion, latestVersion),
      targetVersion: latestVersion,
    };
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return { hasUpdate: false };
  }
}
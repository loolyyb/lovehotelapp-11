import { incrementVersion, needsUpdate } from "./versionUtils";
import { getCurrentVersion, updateVersionInDb } from "./versionDb";

export { getCurrentVersion } from "./versionDb";
export { 
  parseVersion,
  compareVersions,
  needsUpdate,
  incrementVersion 
} from "./versionUtils";

export async function updateVersion(isMajorUpdate: boolean = false): Promise<void> {
  try {
    const currentVersion = await getCurrentVersion();
    const newVersion = incrementVersion(currentVersion, isMajorUpdate);
    await updateVersionInDb(newVersion);
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
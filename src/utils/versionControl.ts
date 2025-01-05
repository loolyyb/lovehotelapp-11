import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface VersionData {
  version: string;
  current?: string;
  available?: string[];
}

// Type guard to check if a value matches the VersionData structure
function isVersionData(value: unknown): value is VersionData {
  if (typeof value === 'object' && value !== null && 'version' in value) {
    return typeof (value as any).version === 'string';
  }
  return false;
}

export async function getCurrentVersion(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'app_version')
      .single();

    if (error) {
      console.error('Error fetching version:', error);
      return '1.0.20';
    }

    if (isVersionData(data?.value)) {
      return data.value.version;
    }
    
    return '1.0.20';
  } catch (error) {
    console.error('Error getting current version:', error);
    return '1.0.20';
  }
}

export async function updateVersion(): Promise<void> {
  try {
    const currentVersion = await getCurrentVersion();
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    const newVersion = `${major}.${minor}.${patch + 1}`;

    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key: 'app_version',
        value: {
          version: newVersion,
          current: newVersion,
          available: [newVersion]
        } as Json
      });

    if (error) {
      console.error('Error updating version:', error);
    }
  } catch (error) {
    console.error('Error updating version:', error);
  }
}
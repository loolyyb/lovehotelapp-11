import { supabase } from "@/integrations/supabase/client";

interface VersionData {
  version: string;
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

    return data?.value?.version || '1.0.20';
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
        value: { version: newVersion },
      });

    if (error) {
      console.error('Error updating version:', error);
    }
  } catch (error) {
    console.error('Error updating version:', error);
  }
}
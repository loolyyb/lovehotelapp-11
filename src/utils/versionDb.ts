import { supabase } from "@/integrations/supabase/client";
import { VersionData } from "@/types/version.types";

const CURRENT_VERSION = '1.0.195';

export async function getCurrentVersion(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'app_version')
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      const { error: insertError } = await supabase
        .from('admin_settings')
        .insert({
          key: 'app_version',
          value: { version: CURRENT_VERSION } as VersionData,
        });

      if (insertError) throw insertError;
      return CURRENT_VERSION;
    }
    
    const { error: updateError } = await supabase
      .from('admin_settings')
      .update({
        value: { version: CURRENT_VERSION } as VersionData,
      })
      .eq('key', 'app_version');

    if (updateError) throw updateError;
    
    return CURRENT_VERSION;
  } catch (error) {
    console.error('Error getting current version:', error);
    return CURRENT_VERSION;
  }
}

export async function updateVersionInDb(newVersion: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key: 'app_version',
        value: { version: newVersion } as VersionData,
      });

    if (error) throw error;
    console.log(`Version updated to ${newVersion}`);
  } catch (error) {
    console.error('Error updating version:', error);
  }
}
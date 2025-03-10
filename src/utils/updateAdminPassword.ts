
import { supabase } from "@/integrations/supabase/client";
import { hashPassword } from "./crypto";

/**
 * Updates the admin password in the database
 * This script should be run once to set the new admin password
 */
export async function updateAdminPassword(newPassword: string = "Reussite888!"): Promise<void> {
  try {
    // Generate a secure hash for the new password
    const secureHash = hashPassword(newPassword);
    
    // Update the admin_settings table with the new hash
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key: 'admin_password_hash',
        value: { hash: secureHash },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    
    if (error) {
      console.error("Failed to update admin password:", error);
      throw error;
    }
    
    console.log("Admin password updated successfully!");
    return;
  } catch (error) {
    console.error("Error updating admin password:", error);
    throw error;
  }
}

// If this file is executed directly (not imported)
if (typeof require !== 'undefined' && require.main === module) {
  updateAdminPassword()
    .then(() => console.log("Password update completed"))
    .catch(err => console.error("Password update failed:", err));
}

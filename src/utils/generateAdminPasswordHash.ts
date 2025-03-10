
import { hashPassword } from './crypto';

// Generate a secure hash for the new admin password: "Reussite888!"
const newPassword = "Reussite888!";
const secureHash = hashPassword(newPassword);

console.log(`
------------------------------------------------
NEW ADMIN PASSWORD HASH GENERATED
------------------------------------------------
Password: ${newPassword}
Secure Hash: ${secureHash}
------------------------------------------------
Use this hash to update the admin_password_hash value in admin_settings table.
------------------------------------------------
`);

// This script is meant to be run once to generate the hash.
// You can run it with: npx ts-node generateAdminPasswordHash.ts

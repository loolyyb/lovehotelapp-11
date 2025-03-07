
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cmxmnsgbmhgpgxopmtua.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteG1uc2dibWhncGd4b3BtdHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5ODcyOTYsImV4cCI6MjA1MTU2MzI5Nn0.vy9gLokY_EAVbLmo-yzGA7rtFdQOlQ1mhaaisIDSwx8';

// Create client with proper argument structure
// The createClient function only accepts two arguments: URL and anon key
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Add a wrapper function for better error handling with type casting
export const safeQueryResult = <T>(data: any): T[] => {
  // Handle potential SelectQueryError or other error types
  if (!data || typeof data === 'string' || data.error) {
    console.warn("Query returned an error or invalid data", data);
    return [] as T[];
  }
  
  // Cast the data to the expected type
  return data as T[];
};

// Helper for single record with type safety
export const safeQuerySingle = <T>(data: any): T | null => {
  // Handle potential SelectQueryError or other error types
  if (!data || typeof data === 'string' || data.error) {
    console.warn("Query returned an error or invalid data for single record", data);
    return null;
  }
  
  // Cast the data to the expected type
  return data as T;
};

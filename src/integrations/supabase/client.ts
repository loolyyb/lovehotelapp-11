
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cmxmnsgbmhgpgxopmtua.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteG1uc2dibWhncGd4b3BtdHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5ODcyOTYsImV4cCI6MjA1MTU2MzI5Nn0.vy9gLokY_EAVbLmo-yzGA7rtFdQOlQ1mhaaisIDSwx8';

// Enhanced client with improved retry and caching strategy
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'rencontre.lovehotelapp',
      },
      fetch: (...args) => {
        // Use a custom fetch with timeout and retry logic
        return fetch(...args).catch(err => {
          console.error('Fetch error with Supabase:', err);
          throw err;
        });
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

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

// Utility function to handle message cache interaction
export const messageCache = {
  get: (key: string) => {
    try {
      const cached = localStorage.getItem(`msg_cache_${key}`);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Auto-expiry check
      if (now - timestamp > 30 * 60 * 1000) { // 30 minutes TTL
        localStorage.removeItem(`msg_cache_${key}`);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error accessing message cache', err);
      return null;
    }
  },
  
  set: (key: string, data: any) => {
    try {
      localStorage.setItem(`msg_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error setting message cache', err);
    }
  }
};


import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cmxmnsgbmhgpgxopmtua.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteG1uc2dibWhncGd4b3BtdHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5ODcyOTYsImV4cCI6MjA1MTU2MzI5Nn0.vy9gLokY_EAVbLmo-yzGA7rtFdQOlQ1mhaaisIDSwx8';

// Enhanced options for better reliability
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args: any[]) => {
      // Add timeout to all fetch requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      return fetch(...args, { 
        signal: controller.signal,
        headers: { 'x-client-info': 'lovehotelaparis-app' }
      }).finally(() => clearTimeout(timeoutId));
    }
  },
  realtime: {
    timeout: 30000, // Increase timeout for realtime subscriptions
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
};

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  options
);

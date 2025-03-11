
// This edge function will run SQL to create the missing database functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseClient || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create the SQL function
    const response = await fetch(`${supabaseClient}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name: 'exec_sql',
        params: {
          sql_string: `
            -- Create function to efficiently get latest messages per conversation
            CREATE OR REPLACE FUNCTION public.get_latest_messages_per_conversation(
              profile_id UUID,
              conversation_ids UUID[]
            ) RETURNS SETOF public.messages AS $$
            BEGIN
              RETURN QUERY
              WITH latest_messages AS (
                SELECT DISTINCT ON (conversation_id)
                  m.*
                FROM public.messages m
                JOIN public.conversations c ON m.conversation_id = c.id
                WHERE m.conversation_id = ANY(conversation_ids)
                  AND (c.user1_id = profile_id OR c.user2_id = profile_id)
                ORDER BY m.conversation_id, m.created_at DESC
              )
              SELECT * FROM latest_messages;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create function:', errorData);
      throw new Error(`Failed to create database function: ${JSON.stringify(errorData)}`);
    }
    
    return new Response(JSON.stringify({ success: true, message: 'Database function created successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error creating database function:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

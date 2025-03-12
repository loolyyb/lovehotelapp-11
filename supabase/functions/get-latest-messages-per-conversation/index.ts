
// Edge function to get the latest message for multiple conversations
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged-in user
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Parse the request body
    const body = await req.json();
    const { conversation_ids, profile_id } = body;

    if (!conversation_ids || !conversation_ids.length || !profile_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: conversation_ids and profile_id are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Use the RPC function to efficiently get latest messages
    const { data, error } = await supabase.rpc(
      'get_latest_messages_per_conversation',
      {
        conversation_ids,
        profile_id
      }
    );

    if (error) {
      console.error('Error fetching latest messages:', error);
      
      // Fallback to direct query if RPC fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          conversation_id,
          sender_id,
          read_at,
          media_type,
          media_url
        `)
        .in('conversation_id', conversation_ids)
        .order('created_at', { ascending: false });
      
      if (fallbackError) {
        throw fallbackError;
      }
      
      // Process the fallback data to get latest message per conversation
      const latestMessagesMap = new Map();
      fallbackData?.forEach(message => {
        if (!latestMessagesMap.has(message.conversation_id) || 
            new Date(message.created_at) > new Date(latestMessagesMap.get(message.conversation_id).created_at)) {
          latestMessagesMap.set(message.conversation_id, message);
        }
      });
      
      const latestMessages = Array.from(latestMessagesMap.values());
      
      return new Response(
        JSON.stringify({ data: latestMessages }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})

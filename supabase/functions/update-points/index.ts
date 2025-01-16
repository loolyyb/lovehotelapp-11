import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    // Get the points from the request body
    const { points } = await req.json()

    if (typeof points !== 'number' || points < 0) {
      throw new Error('Invalid points value')
    }

    // Get current points
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('loyalty_points')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) throw profileError

    const currentPoints = profile?.loyalty_points || 0

    // Update points
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ loyalty_points: currentPoints + points })
      .eq('user_id', user.id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, points: currentPoints + points }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
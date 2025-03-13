import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS requests (CORS preflight)
const handleCors = (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
};

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body to check confirmation
    const requestData = await req.json();
    const { confirm, retention_days } = requestData;
    
    // Verify confirmation
    if (confirm !== true) {
      return new Response(
        JSON.stringify({ error: 'Confirmation required to delete data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If retention_days is provided, only delete data older than that many days
    if (retention_days && !isNaN(retention_days) && retention_days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retention_days);
      const cutoffIso = cutoffDate.toISOString();
      
      // Delete time entries older than cutoff date
      const { error: deleteTimeError } = await supabase
        .from('time_entries')
        .delete()
        .eq('user_id', user.id)
        .lt('start_time', cutoffIso);
        
      if (deleteTimeError) {
        return new Response(
          JSON.stringify({ error: deleteTimeError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Time entries older than ${retention_days} days have been deleted` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    // Otherwise, delete all user data
    else {
      // Delete time entries first (due to foreign key constraints)
      const { error: deleteTimeError } = await supabase
        .from('time_entries')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteTimeError) {
        return new Response(
          JSON.stringify({ error: deleteTimeError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Delete projects
      const { error: deleteProjectsError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteProjectsError) {
        return new Response(
          JSON.stringify({ error: deleteProjectsError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All time entries and projects have been deleted' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
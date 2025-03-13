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

    // Get URL parameters
    const url = new URL(req.url);
    const includeStats = url.searchParams.get('stats') === 'true';
    
    // Get projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If stats requested, get time entry stats for each project
    if (includeStats && projects.length > 0) {
      // Get today's date in ISO format
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();
      
      // Get time entries for all projects
      const { data: timeStats, error: timeError } = await supabase
        .from('time_entries')
        .select('project_id, duration')
        .eq('user_id', user.id)
        .gte('start_time', todayIso)
        .not('duration', 'is', null);

      if (!timeError && timeStats) {
        // Calculate total time for each project
        const projectTotals = {};
        
        timeStats.forEach(entry => {
          if (!entry.project_id) return;
          
          if (!projectTotals[entry.project_id]) {
            projectTotals[entry.project_id] = 0;
          }
          
          projectTotals[entry.project_id] += entry.duration;
        });
        
        // Add stats to projects
        projects.forEach(project => {
          project.todaySeconds = projectTotals[project.id] || 0;
        });
      }
    }

    return new Response(
      JSON.stringify({ data: projects }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
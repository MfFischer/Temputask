// Supabase Edge Function for getting distraction patterns
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { identifyDistractionPatterns, generateRecommendations } from '../../../shared/lib/analytics.js';

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
    
    // Get URL parameters for time range
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('range') || 'month'; // 'week', 'month', 'year'
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // default to month
    }
    
    // Fetch time entries for analysis
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startDate.toISOString())
      .order('start_time', { ascending: false });
    
    if (timeError) {
      return new Response(
        JSON.stringify({ error: timeError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // No data - return empty results
    if (!timeEntries || timeEntries.length === 0) {
      return new Response(
        JSON.stringify({ 
          data: { 
            patterns: [],
            recommendations: [],
            summary: {
              totalEntries: 0,
              distractionCount: 0,
              totalTrackedTime: 0
            }
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Analyze the time entries for patterns
    const patterns = identifyDistractionPatterns(timeEntries);
    
    // Generate recommendations based on patterns
    const recommendations = generateRecommendations(patterns);
    
    // Generate summary statistics
    const distractionEntries = timeEntries.filter(entry => entry.category === 'Distraction');
    const totalDuration = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const distractionDuration = distractionEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    
    const summary = {
      totalEntries: timeEntries.length,
      distractionCount: distractionEntries.length,
      distractionPercentage: totalDuration ? (distractionDuration / totalDuration) * 100 : 0,
      totalTrackedTime: totalDuration,
      distractionTime: distractionDuration,
      productiveTime: totalDuration - distractionDuration,
    };
    
    // Prepare response with analysis results
    return new Response(
      JSON.stringify({ 
        data: { 
          patterns,
          recommendations,
          summary
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
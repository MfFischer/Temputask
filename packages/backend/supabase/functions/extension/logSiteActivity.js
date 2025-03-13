// Supabase Edge Function for logging site activity from the browser extension
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-extension-token',
};

// Handle OPTIONS requests (CORS preflight)
const handleCors = (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
};

// Validate the extension token
const validateExtensionToken = async (supabase, token, userId) => {
  if (!token) return false;
  
  // In a real implementation, you would validate against stored tokens
  // For this example, we'll validate based on token format
  if (!token.startsWith('ext_')) return false;
  
  // Verify this token belongs to the user
  const { data, error } = await supabase
    .from('extension_tokens')
    .select('*')
    .eq('token', token)
    .eq('user_id', userId)
    .single();
    
  return !error && data;
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

    // Check for extension token
    const extensionToken = req.headers.get('X-Extension-Token');
    if (!extensionToken) {
      return new Response(
        JSON.stringify({ error: 'Extension token missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the user ID from the request body
    const { user_id, sites } = await req.json();
    
    if (!user_id || !sites || !Array.isArray(sites)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate the extension token
    const isValidToken = await validateExtensionToken(supabase, extensionToken, user_id);
    if (!isValidToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid extension token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process and validate site data
    const validSites = sites.filter(site => {
      // Basic validation
      if (!site.url || !site.domain || !site.duration || site.duration <= 0) {
        return false;
      }
      
      // Sanitize URL (remove query params for privacy)
      const urlObj = new URL(site.url);
      site.url = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
      
      return true;
    });
    
    if (validSites.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid site data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Insert site activity records
    const { data, error } = await supabase
      .from('site_activities')
      .insert(validSites.map(site => ({
        user_id,
        url: site.url,
        domain: site.domain,
        duration: site.duration,
        timestamp: new Date().toISOString(),
      })));
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, count: validSites.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
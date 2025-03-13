import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createPagesServerClient({ req, res });
    
    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Fetch company profile for the authenticated user
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "Results contain 0 rows" - not an error in this case
      console.error('Error fetching company profile:', error);
      return res.status(500).json({ error: 'Failed to fetch company profile: ' + error.message });
    }

    // If company profile is found, check if there's a logo to fetch
    if (data && data.logo_path) {
      try {
        const { data: logoData, error: logoError } = await supabase
          .storage
          .from('company-logos')
          .createSignedUrl(data.logo_path, 60 * 60); // 1 hour expiry

        if (!logoError && logoData) {
          data.logo_url = logoData.signedUrl;
        }
      } catch (logoErr) {
        console.error('Error getting logo URL:', logoErr);
        // Don't fail the whole request if logo fetch fails
      }
    }

    // Return the company profile (or null if not found)
    return res.status(200).json({ profile: data || null });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
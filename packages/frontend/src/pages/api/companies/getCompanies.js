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
    
    // Get all companies for the authenticated user
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', session.user.id)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching companies:', error);
      return res.status(500).json({ error: 'Failed to fetch companies: ' + error.message });
    }
    
    // For each company, get the count of associated projects
    const companiesWithProjectCounts = await Promise.all(
      data.map(async (company) => {
        const { count, error: countError } = await supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('user_id', session.user.id);
        
        return {
          ...company,
          project_count: countError ? 0 : count || 0
        };
      })
    );
    
    // Return the companies with project counts
    return res.status(200).json({ companies: companiesWithProjectCounts });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
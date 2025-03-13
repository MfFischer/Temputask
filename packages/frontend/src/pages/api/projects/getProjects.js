import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Create authenticated Supabase client
    const supabase = createPagesServerClient({ req, res });
    
    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Extract query parameters
    const includeStats = req.query.stats === 'true';
    const companyId = req.query.company_id; // Filter projects by company
    
    // Build base query
    let query = supabase
      .from('projects')
      .select(`
        *,
        companies:company_id (id, name, color)
      `)
      .eq('user_id', session.user.id);
    
    // Add company filter if specified
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    
    // Transform data to include company_name from the joined table
    let projectsWithCompanyNames = data.map(project => ({
      ...project,
      company_name: project.companies ? project.companies.name : null,
      company_color: project.companies ? project.companies.color : null,
    }));
    
    // If stats are requested, fetch time entries for each project
    if (includeStats) {
      // Get the last 30 days' time entries
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isoDate = thirtyDaysAgo.toISOString();
      
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('project_id, duration')
        .eq('user_id', session.user.id)
        .gte('created_at', isoDate);
      
      if (timeError) {
        console.error('Error fetching time entries:', timeError);
      } else if (timeEntries && timeEntries.length > 0) {
        // Group time entries by project_id
        const entriesByProject = {};
        
        timeEntries.forEach(entry => {
          if (!entriesByProject[entry.project_id]) {
            entriesByProject[entry.project_id] = [];
          }
          entriesByProject[entry.project_id].push(entry);
        });
        
        // Add stats to each project
        projectsWithCompanyNames = projectsWithCompanyNames.map(project => {
          const projectEntries = entriesByProject[project.id] || [];
          const totalTime = projectEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
          
          return {
            ...project,
            stats: {
              totalTime: totalTime,
              entryCount: projectEntries.length
            }
          };
        });
      } else {
        // No time entries found, add empty stats to each project
        projectsWithCompanyNames = projectsWithCompanyNames.map(project => ({
          ...project,
          stats: {
            totalTime: 0,
            entryCount: 0
          }
        }));
      }
    }
    
    // Log the projects being returned for debugging
    console.log(`Returning ${projectsWithCompanyNames.length} projects${companyId ? ' for company ' + companyId : ''}`);
    
    // Return the projects
    return res.status(200).json({ projects: projectsWithCompanyNames });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
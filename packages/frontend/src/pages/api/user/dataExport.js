import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createPagesServerClient({ req, res });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Fetch user's projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id);

    if (projectsError) throw projectsError;

    // Fetch user's time entries
    const { data: timeEntries, error: timeEntriesError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', session.user.id);

    if (timeEntriesError) throw timeEntriesError;

    // Fetch user's distractions if the table exists
    let distractions = [];
    try {
      const { data: distractionsData, error: distractionsError } = await supabase
        .from('distractions')
        .select('*')
        .eq('user_id', session.user.id);

      if (!distractionsError) {
        distractions = distractionsData || [];
      }
    } catch (error) {
      console.log('Note: Distractions table might not exist', error);
      // Continue without distractions data
    }

    // Combine all data
    const exportData = {
      user: {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at
      },
      projects: projects || [],
      timeEntries: timeEntries || [],
      distractions: distractions
    };

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=tempos_data_export.json');
    
    return res.status(200).json(exportData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    return res.status(500).json({ error: 'Error exporting data', details: error.message });
  }
}
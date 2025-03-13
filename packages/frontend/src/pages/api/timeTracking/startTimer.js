import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    const { project_id, category, description = '', duration_minutes = null } = req.body;
    
    console.log('Start timer request:', { project_id, category, description, duration_minutes });
    
    // First check if there's already an active timer
    const { data: activeTimer, error: checkError } = await supabase
      .from('time_entries')
      .select('id')
      .eq('user_id', session.user.id)
      .is('end_time', null)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking active timer:', checkError);
      return res.status(500).json({ error: 'Failed to check for active timer' });
    }
    
    if (activeTimer) {
      return res.status(400).json({ error: 'You already have an active timer' });
    }
    
    // Create a new time entry
    const now = new Date().toISOString();
    
    // This query includes the project name and color in the response
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: session.user.id,
        project_id,
        category,
        description,
        start_time: now,
        end_time: null,
      })
      .select(`
        *,
        projects (
          name,
          color
        )
      `)
      .single();

    if (error) {
      console.error('Error starting timer:', error);
      return res.status(500).json({ error: 'Failed to start timer: ' + error.message });
    }

    // Return the new time entry
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
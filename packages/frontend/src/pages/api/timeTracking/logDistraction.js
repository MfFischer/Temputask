import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createServerSupabaseClient({ req, res });
    
    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { description, duration_minutes } = req.body;
    
    if (!description || !duration_minutes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const now = new Date();
    const durationSeconds = duration_minutes * 60;
    
    // Calculate start time based on duration
    const startTime = new Date(now.getTime() - (durationSeconds * 1000));
    
    // Create a new time entry for the distraction
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: session.user.id,
        category: 'Distraction',
        description,
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        duration: durationSeconds,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging distraction:', error);
      return res.status(500).json({ error: 'Failed to log distraction' });
    }

    // Return the new distraction entry
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
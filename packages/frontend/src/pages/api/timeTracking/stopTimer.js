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

    const { entry_id } = req.body;
    
    console.log('Stopping timer for entry:', entry_id);
    
    if (!entry_id) {
      // If no entry_id provided, try to find the active timer
      const { data: activeTimer, error: findError } = await supabase
        .from('time_entries')
        .select('id, start_time')
        .eq('user_id', session.user.id)
        .is('end_time', null)
        .single();
        
      if (findError) {
        console.error('Error finding active timer:', findError);
        return res.status(404).json({ error: 'No active timer found' });
      }
      
      if (!activeTimer) {
        return res.status(404).json({ error: 'No active timer found' });
      }
      
      console.log('Found active timer:', activeTimer.id);
      
      // Get the current time entry to calculate duration
      const { data: currentEntry, error: fetchError } = await supabase
        .from('time_entries')
        .select('start_time')
        .eq('id', activeTimer.id)
        .eq('user_id', session.user.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching time entry:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch time entry' });
      }
      
      if (!currentEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
      }
      
      // Calculate duration in seconds
      const now = new Date();
      const startTime = new Date(currentEntry.start_time);
      const durationSeconds = Math.floor((now - startTime) / 1000);
      
      console.log('Calculated duration:', durationSeconds, 'seconds');
      
      // Update the time entry
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          end_time: now.toISOString(),
          duration: durationSeconds,
        })
        .eq('id', activeTimer.id)
        .eq('user_id', session.user.id)
        .select(`
          *,
          projects (
            name,
            color
          )
        `)
        .single();

      if (error) {
        console.error('Error stopping timer:', error);
        return res.status(500).json({ error: 'Failed to stop timer' });
      }

      // Return the updated time entry
      return res.status(200).json({ data });
    } else {
      // If entry_id is provided, use it
      // Get the current time entry to calculate duration
      const { data: currentEntry, error: fetchError } = await supabase
        .from('time_entries')
        .select('start_time')
        .eq('id', entry_id)
        .eq('user_id', session.user.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching time entry:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch time entry' });
      }
      
      if (!currentEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
      }
      
      // Calculate duration in seconds
      const now = new Date();
      const startTime = new Date(currentEntry.start_time);
      const durationSeconds = Math.floor((now - startTime) / 1000);
      
      // Update the time entry
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          end_time: now.toISOString(),
          duration: durationSeconds,
        })
        .eq('id', entry_id)
        .eq('user_id', session.user.id)
        .select(`
          *,
          projects (
            name,
            color
          )
        `)
        .single();

      if (error) {
        console.error('Error stopping timer:', error);
        return res.status(500).json({ error: 'Failed to stop timer' });
      }

      // Return the updated time entry
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
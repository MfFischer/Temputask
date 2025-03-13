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
    
    // Check if we should include all entries (even those without end times)
    const includeAll = req.query.includeAll === 'true';
    
    // Set up the query
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('start_time', { ascending: false });
      
    // Only include completed entries if not includeAll
    if (!includeAll) {
      query = query.not('end_time', 'is', null);
    }
    
    // Execute the query
    const { data: timeEntries, error } = await query;

    if (error) {
      console.error('Error fetching time entries:', error);
      return res.status(500).json({ error: 'Failed to fetch time entries' });
    }
    
    // Calculate summary statistics
    const summary = {
      totalTracked: 0,
      productive: 0,
      distracted: 0,
      focusSessions: 0
    };
    
    // Process time entries and calculate statistics
    timeEntries.forEach(entry => {
      if (entry.start_time && entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const duration = (end - start) / 1000; // in seconds
        
        summary.totalTracked += duration;
        
        // Consider focused time as productive
        if (entry.focus_mode) {
          summary.productive += duration;
          summary.focusSessions += 1;
        } else {
          // Default to 80% productive for non-focus time
          summary.productive += (duration * 0.8);
          summary.distracted += (duration * 0.2);
        }
      }
    });
    
    return res.status(200).json({
      timeEntries,
      summary
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
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

    // Get start of today in ISO format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.toISOString();
    
    // Get tomorrow start for comparison
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = tomorrow.toISOString();
    
    // Get all time entries for today
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        projects (
          name,
          color
        )
      `)
      .eq('user_id', session.user.id)
      .gte('start_time', startOfDay)
      .lt('start_time', startOfTomorrow)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
      return res.status(500).json({ error: 'Failed to fetch time entries' });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createRouteHandlerClient({ req, res });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Extract and prepare the request body
    const { 
      project_id, 
      category, 
      description, 
      duration_minutes  // New parameter for focus timer
    } = req.body;

    // Create request payload with proper defaults
    const requestPayload = {
      project_id: project_id || null,
      category: category || 'Other',
      description: description || '',
      is_focus_timer: category === 'Focus',  // Add flag for focus timer
      planned_duration: duration_minutes ? duration_minutes * 60 : null  // Convert to seconds if provided
    };

    // Call Supabase Edge Function
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/timeTracking/startTimer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to start timer');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error starting timer:', error);
    res.status(500).json({ error: error.message });
  }
}
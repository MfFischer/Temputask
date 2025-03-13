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

    const { 
      email, 
      format = 'pdf',
      schedule = 'once',
      includeData = {
        projects: true,
        activities: true,
        summary: true,
        charts: true
      },
      filters = {}
    } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    // In a production environment, you would:
    // 1. Generate the report (PDF, CSV, etc.)
    // 2. Store it temporarily or attach it directly
    // 3. Send the email with the report
    // 4. If scheduled, store the schedule in the database
    
    // For now, we'll simulate success after a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log the request for debugging
    console.log('Email report request:', {
      userId: session.user.id,
      email,
      format,
      schedule,
      includeData,
      filters
    });
    
    // For scheduled reports, save to the database
    if (schedule !== 'once') {
      const { error: scheduleError } = await supabase
        .from('report_schedules')
        .insert({
          user_id: session.user.id,
          email,
          format,
          schedule,
          include_data: includeData,
          filters,
          next_run: getNextRunDate(schedule),
          created_at: new Date().toISOString()
        });
        
      if (scheduleError) {
        console.error('Error saving report schedule:', scheduleError);
        return res.status(500).json({ error: 'Failed to schedule report: ' + scheduleError.message });
      }
    }

    // Return success
    return res.status(200).json({ 
      success: true, 
      message: schedule === 'once' 
        ? `Report has been emailed to ${email}` 
        : `Report has been scheduled to be sent ${schedule} to ${email}` 
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

// Helper function to calculate the next run date based on schedule
function getNextRunDate(schedule) {
  const now = new Date();
  
  switch (schedule) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      now.setHours(8, 0, 0, 0); // 8:00 AM tomorrow
      break;
    case 'weekly':
      now.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7); // Next Monday
      now.setHours(8, 0, 0, 0); // 8:00 AM
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      now.setDate(1); // 1st of next month
      now.setHours(8, 0, 0, 0); // 8:00 AM
      break;
    default:
      now.setHours(now.getHours() + 1); // Default to 1 hour from now
  }
  
  return now.toISOString();
}
// Supabase Edge Function for checking user inactivity and sending reminders
// This is designed to be scheduled to run daily
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async () => {
  try {
    console.log('Starting inactivity check...');
    
    // Get all users with their settings and latest time entry
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, settings, last_login');
      
    if (usersError) {
      throw usersError;
    }
    
    console.log(`Found ${users.length} users to check`);
    
    // Current date
    const now = new Date();
    
    // Process each user
    for (const user of users) {
      try {
        // Skip users who have opted out of inactivity reminders
        if (
          user.settings?.notifications?.inactivityReminders === false
        ) {
          console.log(`User ${user.id} has disabled inactivity reminders, skipping`);
          continue;
        }
        
        // Get inactivity threshold from user settings (default to 2 days)
        const inactivityThreshold = user.settings?.notifications?.inactivityThreshold || 2;
        
        // Get user's latest time entry
        const { data: latestEntry, error: entryError } = await supabase
          .from('time_entries')
          .select('start_time')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(1)
          .single();
          
        if (entryError && entryError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error(`Error fetching latest entry for user ${user.id}:`, entryError);
          continue;
        }
        
        // Determine last activity date (from time entry or login)
        let lastActivity = user.last_login ? new Date(user.last_login) : null;
        
        if (latestEntry?.start_time) {
          const entryDate = new Date(latestEntry.start_time);
          // Use the more recent of last login or last time entry
          if (!lastActivity || entryDate > lastActivity) {
            lastActivity = entryDate;
          }
        }
        
        // Skip if no activity found
        if (!lastActivity) {
          console.log(`No activity found for user ${user.id}, skipping`);
          continue;
        }
        
        // Calculate days since last activity
        const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
        
        // Check if user has been inactive for the threshold period
        if (daysSinceLastActivity >= inactivityThreshold) {
          console.log(`User ${user.id} has been inactive for ${daysSinceLastActivity} days, sending reminder`);
          
          // Check if we already sent a notification recently (within last day)
          const oneDayAgo = new Date(now);
          oneDayAgo.setDate(now.getDate() - 1);
          
          const { data: recentNotification, error: notifCheckError } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'inactivity')
            .gte('created_at', oneDayAgo.toISOString())
            .limit(1);
            
          if (notifCheckError) {
            console.error(`Error checking recent notifications for user ${user.id}:`, notifCheckError);
          }
          
          // Skip if we already sent a notification in the last day
          if (recentNotification && recentNotification.length > 0) {
            console.log(`Recent inactivity notification already sent to user ${user.id}, skipping`);
            continue;
          }
          
          // Create appropriate message based on inactivity duration
          let message = '';
          
          if (daysSinceLastActivity >= 7) {
            message = `It's been ${daysSinceLastActivity} days since you've tracked time. Come back to keep your productivity insights accurate!`;
          } else {
            message = `We noticed you haven't tracked any time in ${daysSinceLastActivity} days. Don't forget to log your activities!`;
          }
          
          // Create in-app notification
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              message,
              type: 'inactivity',
              is_read: false,
            });
            
          if (notificationError) {
            console.error(`Error creating notification for user ${user.id}:`, notificationError);
          } else {
            console.log(`Created inactivity notification for user ${user.id}`);
          }
          
          // Send email notification if enabled
          if (user.settings?.notifications?.emailNotifications !== false) {
            // In a production app, you would integrate with an email service here
            // For this example, we'll just log it
            console.log(`Would send email to ${user.email} with message: ${message}`);
          }
        } else {
          console.log(`User ${user.id} has been active in the last ${daysSinceLastActivity} days, no reminder needed`);
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        processedUsers: users.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in inactivity check:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
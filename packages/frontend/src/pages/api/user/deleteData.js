import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get request body
  const { confirm, retention_days } = req.body;

  if (!confirm) {
    return res.status(400).json({ error: 'Confirmation required' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createPagesServerClient({ req, res });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate cutoff date if retention_days is specified
    let cutoffDate = null;
    if (retention_days) {
      cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retention_days);
    }

    // Delete time entries
    if (cutoffDate) {
      // Delete older than retention period
      const { error: timeEntriesError } = await supabase
        .from('time_entries')
        .delete()
        .eq('user_id', session.user.id)
        .lt('created_at', cutoffDate.toISOString());

      if (timeEntriesError) throw timeEntriesError;
    } else {
      // Delete all
      const { error: timeEntriesError } = await supabase
        .from('time_entries')
        .delete()
        .eq('user_id', session.user.id);

      if (timeEntriesError) throw timeEntriesError;
    }

    // Delete distractions if they exist
    try {
      if (cutoffDate) {
        await supabase
          .from('distractions')
          .delete()
          .eq('user_id', session.user.id)
          .lt('created_at', cutoffDate.toISOString());
      } else {
        await supabase
          .from('distractions')
          .delete()
          .eq('user_id', session.user.id);
      }
    } catch (error) {
      // Ignore error as distractions table might not exist
      console.log('Note: Distractions table might not exist', error);
    }

    // Delete projects only if deleting all data
    if (!retention_days) {
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', session.user.id);

      if (projectsError) throw projectsError;
    }

    return res.status(200).json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return res.status(500).json({ error: 'Error deleting data', details: error.message });
  }
}
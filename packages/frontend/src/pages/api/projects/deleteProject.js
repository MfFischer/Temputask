import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
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

    const { project_id } = req.body;
    
    if (!project_id) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // First verify this is the user's project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', session.user.id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching project:', fetchError);
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or you do not have permission to delete it' });
    }
    
    // Update any time entries that reference this project
    const { error: updateError } = await supabase
      .from('time_entries')
      .update({ project_id: null })
      .eq('project_id', project_id);
    
    if (updateError) {
      console.error('Error updating related time entries:', updateError);
      return res.status(500).json({ error: 'Failed to update related time entries' });
    }
    
    // Delete the project
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', project_id)
      .eq('user_id', session.user.id);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
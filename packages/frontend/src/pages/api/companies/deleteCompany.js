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

    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Company ID is required' });
    }
    
    // Verify this company belongs to the authenticated user
    const { data: existingCompany, error: companyCheckError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    if (companyCheckError) {
      console.error('Error checking company:', companyCheckError);
      return res.status(404).json({ error: 'Company not found or you do not have permission to delete it' });
    }
    
    // Check for associated projects
    const { data: associatedProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('company_id', id);
    
    if (projectsError) {
      console.error('Error checking associated projects:', projectsError);
      return res.status(500).json({ error: 'Error checking associated projects' });
    }
    
    // If there are associated projects, update them to remove the company association
    if (associatedProjects && associatedProjects.length > 0) {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ company_id: null })
        .eq('company_id', id);
      
      if (updateError) {
        console.error('Error updating associated projects:', updateError);
        return res.status(500).json({ error: 'Failed to update associated projects' });
      }
    }
    
    // Delete the company
    console.log('Deleting company:', id);
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id); // Extra security check

    if (error) {
      console.error('Error deleting company:', error);
      return res.status(500).json({ error: 'Failed to delete company: ' + error.message });
    }

    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
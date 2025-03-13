import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Allow both POST and PATCH requests
  if (req.method !== 'POST' && req.method !== 'PATCH') {
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

    const { id, name, description, color } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Company ID is required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
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
      return res.status(404).json({ error: 'Company not found or you do not have permission to update it' });
    }
    
    // Update the company
    console.log('Updating company:', id);
    const { data, error } = await supabase
      .from('companies')
      .update({
        name,
        description: description || null,
        color: color || '#3B82F6',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id) // Extra security check
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      return res.status(500).json({ error: 'Failed to update company: ' + error.message });
    }

    // Return the updated company
    return res.status(200).json({ company: data });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
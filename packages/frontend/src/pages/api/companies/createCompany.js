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

    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    // First, ensure the user exists in the public.users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single();
    
    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking user:', userCheckError);
      return res.status(500).json({ error: 'Error checking user record' });
    }
    
    // If user doesn't exist in the public.users table, create them
    if (!existingUser) {
      console.log('User not found in public.users table. Creating user record...');
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          created_at: new Date().toISOString()
        });
      
      if (createUserError) {
        console.error('Error creating user record:', createUserError);
        return res.status(500).json({ error: 'Failed to create user record' });
      }
      
      console.log('User record created successfully');
    }
    
    // Now create the company
    console.log('Creating company for user:', session.user.id);
    const { data, error } = await supabase
      .from('companies')
      .insert({
        user_id: session.user.id,
        name,
        description: description || null,
        color: color || '#3B82F6',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return res.status(500).json({ error: 'Failed to create company: ' + error.message });
    }

    // Return the new company
    return res.status(200).json({ company: data });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
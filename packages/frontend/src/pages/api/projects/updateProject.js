import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Only allow PATCH requests
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Request body received:', JSON.stringify(req.body, null, 2));
    
    // Create authenticated Supabase client
    const supabase = createPagesServerClient({ req, res });
    
    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Extract project_id and updates from request body
    const { project_id, updates } = req.body;
    
    if (!project_id) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    // Check if required fields are present
    if (updates.name === undefined || updates.name === '') {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    // Clean up the update data to ensure proper types
    const cleanedUpdates = {
      name: updates.name,
      description: updates.description || '',
      color: updates.color || '#3B82F6',
      company_id: updates.company_id || null,
      default_hourly_rate: updates.default_hourly_rate !== undefined ? 
        parseFloat(updates.default_hourly_rate) : null,
      currency: updates.currency || 'USD',
      updated_at: new Date().toISOString() // Force update of timestamp
    };
    
    console.log('Cleaned updates:', JSON.stringify(cleanedUpdates, null, 2));
    
    // Verify project belongs to this user
    const { data: existingProject, error: projectCheckError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .eq('user_id', session.user.id)
      .single();
    
    if (projectCheckError) {
      console.error('Error checking project:', projectCheckError);
      return res.status(404).json({ error: 'Project not found or access denied' });
    }
    
    console.log('Found existing project:', JSON.stringify(existingProject, null, 2));
    
    // If company_id is provided in updates, verify it belongs to the authenticated user
    if (cleanedUpdates.company_id) {
      const { data: companyData, error: companyCheckError } = await supabase
        .from('companies')
        .select('id, name, color')
        .eq('id', cleanedUpdates.company_id)
        .eq('user_id', session.user.id)
        .single();
      
      if (companyCheckError) {
        console.error('Error checking company:', companyCheckError);
        return res.status(400).json({ error: 'Invalid company selected' });
      }
      
      console.log('Company verified:', JSON.stringify(companyData, null, 2));
    }
    
    // Update the project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(cleanedUpdates)
      .eq('id', project_id)
      .eq('user_id', session.user.id)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('Error updating project:', updateError);
      return res.status(500).json({ error: 'Failed to update project: ' + updateError.message });
    }
    
    console.log('Updated project in database:', JSON.stringify(updatedProject, null, 2));
    
    // Fetch company information if there's a company_id
    let companyInfo = null;
    if (updatedProject.company_id) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('name, color')
        .eq('id', updatedProject.company_id)
        .single();
      
      if (!companyError && company) {
        companyInfo = company;
        console.log('Retrieved company info:', JSON.stringify(companyInfo, null, 2));
      } else if (companyError) {
        console.error('Error fetching company info:', companyError);
      }
    }
    
    // Get time tracking stats
    let projectStats = null;
    
    // Get the last 30 days' time entries for this project
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('duration')
      .eq('project_id', project_id)
      .eq('user_id', session.user.id)
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (!timeError && timeEntries && timeEntries.length > 0) {
      const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      projectStats = {
        totalTime: totalTime,
        entryCount: timeEntries.length
      };
      console.log('Time stats calculated:', JSON.stringify(projectStats, null, 2));
    } else {
      projectStats = { totalTime: 0, entryCount: 0 };
      if (timeError) {
        console.error('Error fetching time entries:', timeError);
      }
    }
    
    // Combine all data for response
    const responseData = {
      ...updatedProject,
      company_name: companyInfo ? companyInfo.name : null,
      company_color: companyInfo ? companyInfo.color : null,
      stats: projectStats
    };
    
    console.log('Final response data:', JSON.stringify(responseData, null, 2));
    
    // Return the updated project with company information and stats
    return res.status(200).json({ project: responseData });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  try {
    // Create Supabase client
    const supabase = createPagesServerClient({ req, res });
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(200).json({ 
        authenticated: false,
        message: 'No active session'
      });
    }
    
    // Check if user exists in public.users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    // Check database tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    // Get schema info for projects table
    const { data: projectsColumns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'projects')
      .eq('table_schema', 'public');
    
    // Get one row from projects table if it exists
    let projectsTableData = null;
    let projectsError = null;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      
      projectsTableData = data;
      projectsError = error;
    } catch (err) {
      projectsError = err;
    }
    
    return res.status(200).json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        exists_in_public_users: !!user,
        user_record: user,
        user_error: userError ? userError.message : null
      },
      database: {
        tables: tables ? tables.map(t => t.table_name) : [],
        tables_error: tablesError ? tablesError.message : null,
        projects_columns: projectsColumns,
        columns_error: columnsError ? columnsError.message : null,
        projects_sample: projectsTableData,
        projects_error: projectsError ? projectsError.message : null
      }
    });
  } catch (error) {
    console.error('Error in auth debug endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
}
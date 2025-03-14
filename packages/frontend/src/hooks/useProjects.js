import { useState, useEffect, useContext } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AuthContext } from '../contexts/AuthContext';

export function useProjects() {
  const { user } = useContext(AuthContext);
  const supabase = useSupabaseClient();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects on component mount or when user changes
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setIsLoading(false);
    }
  }, [user]);

  // Fetch all projects
  const fetchProjects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Query projects directly from Supabase
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (projectsError) {
        throw new Error(projectsError.message || 'Failed to fetch projects');
      }
      
      // Get company information for each project
      const projectsWithCompanies = await Promise.all(
        projectsData.map(async (project) => {
          if (!project.company_id) {
            return {
              ...project,
              company_name: null,
              company_color: null
            };
          }
          
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('name, color')
            .eq('id', project.company_id)
            .single();
          
          return {
            ...project,
            company_name: companyError ? null : companyData.name,
            company_color: companyError ? null : companyData.color
          };
        })
      );
      
      // Get time statistics for each project
      const projectsWithStats = await Promise.all(
        projectsWithCompanies.map(async (project) => {
          // Get time entries for this project
          const { data: timeEntries, error: timeError } = await supabase
            .from('time_entries')
            .select('duration')
            .eq('project_id', project.id)
            .eq('user_id', user.id)
            .not('duration', 'is', null);
          
          if (timeError) {
            return {
              ...project,
              stats: {
                totalTime: 0,
                totalEntries: 0
              }
            };
          }
          
          const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
          
          return {
            ...project,
            stats: {
              totalTime,
              totalEntries: timeEntries.length
            }
          };
        })
      );
      
      console.log('Fetched projects:', projectsWithStats); // Debug log
      setProjects(projectsWithStats || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new project with project data object
  const createProject = async (projectData) => {
    if (!user) return null;
    
    try {
      console.log('Creating project with data:', projectData); // Debug log
      
      // Add user_id to project data
      const newProjectData = {
        ...projectData,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      // Insert project directly into Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert(newProjectData)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to create project');
      }
      
      // Fetch the company name if there's a company_id
      let company_name = null;
      let company_color = null;
      
      if (data.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('name, color')
          .eq('id', data.company_id)
          .single();
        
        if (!companyError) {
          company_name = companyData.name;
          company_color = companyData.color;
        }
      }
      
      const project = {
        ...data,
        company_name,
        company_color,
        stats: {
          totalTime: 0,
          totalEntries: 0
        }
      };
      
      console.log('Created project:', project); // Debug log
      
      // Update local state
      setProjects(prevProjects => [project, ...prevProjects]);
      
      return project;
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project');
      return null;
    }
  };

  
  const updateProject = async (projectId, updatesData) => {
    if (!user) return null;
    
    try {
      // Type checking to prevent errors
      console.log('updateProject called with:', {
        projectId,
        updatesDataType: typeof updatesData,
        updatesData
      });
      
      // Safety check to prevent string being passed as updates
      if (typeof updatesData !== 'object' || updatesData === null) {
        console.error('Invalid updates data - must be an object:', updatesData);
        throw new Error('Updates must be an object, not a string or other type');
      }
      
      // Validate name is present
      if (!updatesData.name || updatesData.name.trim() === '') {
        console.error('Project name cannot be empty');
        throw new Error('Project name is required');
      }
      
      // Ensure we have a clean object for updates
      const cleanUpdates = {
        name: updatesData.name.trim(),
        description: updatesData.description || '',
        color: updatesData.color || '#3B82F6',
        company_id: updatesData.company_id || null,
        default_hourly_rate: updatesData.default_hourly_rate !== undefined ? 
          parseFloat(updatesData.default_hourly_rate) : null,
        currency: updatesData.currency || 'USD'
      };
      
      console.log('Sending update request with clean data:', cleanUpdates);
      
      // Update project directly in Supabase
      const { data, error } = await supabase
        .from('projects')
        .update(cleanUpdates)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to update project');
      }
      
      // Fetch the company name if there's a company_id
      let company_name = null;
      let company_color = null;
      
      if (data.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('name, color')
          .eq('id', data.company_id)
          .single();
        
        if (!companyError) {
          company_name = companyData.name;
          company_color = companyData.color;
        }
      }
      
      // Get existing project stats
      const existingProject = projects.find(p => p.id === projectId);
      const stats = existingProject?.stats || { totalTime: 0, totalEntries: 0 };
      
      const project = {
        ...data,
        company_name,
        company_color,
        stats
      };
      
      console.log('Updated project response:', project); // Debug log
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === project.id ? project : p)
      );
      
      return project;
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project: ' + err.message);
      return null;
    }
  };

  // Delete a project
  const deleteProject = async (projectId) => {
    if (!user) return false;
    
    try {
      // Delete project directly from Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);
      
      if (error) {
        throw new Error(error.message || 'Failed to delete project');
      }
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.filter(p => p.id !== projectId)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
      return false;
    }
  };

  // Get project details with company information
  const getProjectWithCompany = async (projectId) => {
    if (!user) return null;
    
    try {
      // Get project directly from Supabase
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch project details');
      }
      
      // Get company information if available
      if (data.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', data.company_id)
          .single();
        
        if (!companyError) {
          const project = {
            ...data,
            company: companyData
          };
          return project;
        }
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to fetch project details');
      return null;
    }
  };

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectWithCompany
  };
}
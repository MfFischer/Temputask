import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useProjects() {
  const { user } = useContext(AuthContext);
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
      // Add timestamp to prevent browser caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/projects/getProjects?stats=true&_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects');
      }
      
      const data = await response.json();
      console.log('Fetched projects:', data.projects); // Debug log
      setProjects(data.projects || []);
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
      
      const response = await fetch('/api/projects/createProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }
      
      const { project } = await response.json();
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
    
    const response = await fetch(`/api/projects/updateProject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        project_id: projectId,
        updates: cleanUpdates 
      }),
    });
    
    // Improved error handling to avoid reading the body twice
    if (!response.ok) {
      // Clone the response before reading the body
      const errorResponse = response.clone();
      
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      } catch (jsonError) {
        // If JSON parsing fails, use the cloned response for text
        const errorText = await errorResponse.text();
        throw new Error(`Failed to update project: ${errorText}`);
      }
    }
    
    const { project } = await response.json();
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
      const response = await fetch(`/api/projects/deleteProject`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: projectId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
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
      const response = await fetch(`/api/projects/getProject?id=${projectId}&includeCompany=true`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch project details');
      }
      
      const { project } = await response.json();
      return project;
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
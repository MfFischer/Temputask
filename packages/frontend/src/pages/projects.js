import React, { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import AddProjectForm from '../components/projects/AddProjectForm';
import { FolderIcon, ClockIcon, BriefcaseIcon, CurrencyDollarIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function ProjectsPage() {
  const { projects, isLoading, error, createProject, updateProject, deleteProject, fetchProjects } = useProjects();
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectStats, setProjectStats] = useState({});
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return '0h 0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };
  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
  // Load companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const response = await fetch('/api/companies/getCompanies');
        
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies || []);
        } else {
          console.error('Failed to load companies');
        }
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  // Load project time statistics
  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        // Get the last 30 days of time entries for statistics
        const response = await fetch('/api/projects/getProjects?stats=true');
        
        if (response.ok) {
          const data = await response.json();
          setProjectStats(data);
        } else {
          console.error('Failed to load project statistics');
        }
      } catch (error) {
        console.error('Error loading project statistics:', error);
      }
    };
    
    if (projects && projects.length > 0) {
      fetchProjectStats();
    }
  }, [projects]);
  
  const handleAddProject = () => {
    setEditingProject(null);
    setShowAddForm(true);
  };
  
  const handleEditProject = (project) => {
    console.log('Editing project:', project); // Debug log
    
    // Make a copy of the project to avoid reference issues
    const projectToEdit = {
      ...project,
      // Ensure all fields are properly formatted for the form
      name: project.name || '',
      description: project.description || '',
      color: project.color || '#3B82F6',
      company_id: project.company_id || '',
      default_hourly_rate: project.default_hourly_rate !== null ? 
        project.default_hourly_rate.toString() : '',
      currency: project.currency || 'USD'
    };
    
    console.log('Prepared project for editing:', projectToEdit);
    
    // Set the editing project state and show the form
    setEditingProject(projectToEdit);
    setShowAddForm(true);
  };
  
  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingProject(null);
  };
  
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(projectId);
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    }
  };
  
 
  // Replace your current handleSubmitProject function
const handleSubmitProject = async (projectData) => {
  try {
    console.log('Project data received from form:', projectData);
    
    // Validate name is present
    if (!projectData.name || projectData.name.trim() === '') {
      console.error('Project name is required');
      return;
    }
    
    if (editingProject) {
      console.log('Updating project ID:', editingProject.id);
      
      // Update existing project
      const result = await updateProject(editingProject.id, projectData);
      
      console.log('Update project result:', result);
      
      if (result) {
        console.log('Project updated successfully');
        await fetchProjects();
      } else {
        console.error('Failed to update project');
      }
    } else {
      console.log('Creating new project');
      
      // Create new project with project data object
      const result = await createProject(projectData);
      
      console.log('Create project result:', result);
      
      if (result) {
        console.log('Project created successfully');
        await fetchProjects();
      } else {
        console.error('Failed to create project');
      }
    }
    
    // Close the form
    setShowAddForm(false);
    setEditingProject(null);
  } catch (error) {
    console.error('Error in handleSubmitProject:', error);
  }
};
  
  // Sort projects based on current sort field and direction
  const getSortedProjects = () => {
    if (!projects) return [];
    
    return [...projects].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'company':
          aValue = a.company_name || '';
          bValue = b.company_name || '';
          break;
        case 'rate':
          aValue = a.default_hourly_rate || 0;
          bValue = b.default_hourly_rate || 0;
          break;
        case 'hours':
          aValue = (a.stats && a.stats.totalTime) || 0;
          bValue = (b.stats && b.stats.totalTime) || 0;
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }
      
      // String comparison for string fields
      if (typeof aValue === 'string') {
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Numeric comparison for number fields
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };
  
  // Render loading state
  const renderLoading = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
  
  // Render error state
  const renderError = () => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"></div>
        <FolderIcon className="absolute inset-0 m-auto h-10 w-10 text-indigo-500 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No projects yet</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first project to start tracking time.</p>
      <button
        onClick={handleAddProject}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Create Project
      </button>
    </div>
  );
  
  // Render list view
  const renderListView = () => {
    const sortedProjects = getSortedProjects();
    
    return (
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Project Name</span>
                  {sortField === 'name' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                      }
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center">
                  <span>Company</span>
                  {sortField === 'company' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                      }
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('rate')}
              >
                <div className="flex items-center">
                  <span>Hourly Rate</span>
                  {sortField === 'rate' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                      }
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('hours')}
              >
                <div className="flex items-center">
                  <span>Hours Tracked</span>
                  {sortField === 'hours' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                      }
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </div>
                      {project.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {project.company_name ? (
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: project.company_color || '#6B7280' }}
                      ></div>
                      <span className="text-gray-900 dark:text-white">{project.company_name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {project.default_hourly_rate ? (
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(project.default_hourly_rate, project.currency || 'USD')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                    <span className="text-gray-900 dark:text-white">
                      {project.stats ? formatTime(project.stats.totalTime) : '0h 0m'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render grid view (your existing card view)
  const renderGridView = () => {
    const sortedProjects = getSortedProjects();
    
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <div 
              className="h-2" 
              style={{ backgroundColor: project.color }}
            ></div>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg dark:text-white mb-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {project.description}
                    </p>
                  )}
                  {project.company_name && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                      <BriefcaseIcon className="h-3 w-3 mr-1" />
                      <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: project.company_color || '#6B7280' }}></span>
                      {project.company_name}
                    </div>
                  )}
                  {project.default_hourly_rate && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                      <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                      Rate: {formatCurrency(project.default_hourly_rate, project.currency || 'USD')}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Hours: {project.stats ? formatTime(project.stats.totalTime) : '0h 0m'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProject(project)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Edit project"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    title="Delete project"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render projects based on the current view mode
  const renderProjects = () => {
    if (isLoading) {
      return renderLoading();
    }

    if (error) {
      return renderError();
    }

    if (!projects || projects.length === 0) {
      return renderEmptyState();
    }

    return viewMode === 'list' ? renderListView() : renderGridView();
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold dark:text-white">Projects</h1>
        
        <div className="flex items-center space-x-4">
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm font-medium ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Grid
            </button>
          </div>
          
          {/* Add project button */}
          {!showAddForm && projects && projects.length > 0 && (
            <button
              onClick={handleAddProject}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Project
            </button>
          )}
        </div>
      </div>
      
      {showAddForm ? (
        <AddProjectForm
          onSubmit={handleSubmitProject}
          onCancel={handleCancelForm}
          initialData={editingProject}
          companies={companies}
        />
      ) : (
        renderProjects()
      )}
    </div>
  );
}
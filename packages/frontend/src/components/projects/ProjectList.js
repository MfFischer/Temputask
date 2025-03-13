import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useFocus } from '../../hooks/useFocus';
import { 
  ClockIcon, 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const ProjectList = ({ onEdit }) => {
  const { projects, isLoading, error, deleteProject } = useProjects();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isFocusActive } = useFocus();
  
  // Format time duration (in seconds) to human-readable format
  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete.id);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="animate-pulse p-8">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded col-span-2"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <div className="text-center text-red-600 dark:text-red-400">
          <ExclamationTriangleIcon className="h-10 w-10 mx-auto mb-3" />
          <h3 className="text-lg font-medium">Error loading projects</h3>
          <p className="mt-1">{error}</p>
        </div>
      </Card>
    );
  }
  
  if (projects.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center py-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"></div>
            <FolderIcon className="absolute inset-0 m-auto h-10 w-10 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No projects yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first project to start tracking your time!</p>
        </div>
      </Card>
    );
  }
  
  return (
    <>
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: project.color || '#3B82F6' }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {project.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
              )}
              
              {project.stats && (
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Total Time</p>
                    <p className="text-lg font-bold flex items-center text-gray-900 dark:text-gray-100">
                      <ClockIcon className="w-5 h-5 mr-1 text-gray-400 dark:text-gray-500" />
                      {formatDuration(project.stats.totalTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Sessions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {project.stats.entryCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Average Session</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatDuration(project.stats.averageTime)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  icon={<PencilIcon className="h-4 w-4" />}
                  onClick={() => onEdit(project)}
                >
                  Edit
                </Button>
                
                <Button 
                  variant="danger"
                  size="sm"
                  icon={<TrashIcon className="h-4 w-4" />}
                  onClick={() => handleDeleteClick(project)}
                >
                  Delete
                </Button>
                
                <Button 
                  variant="primary"
                  size="sm"
                  icon={<PlayIcon className="h-4 w-4" />}
                  onClick={() => {
                    // Navigate to timer page with project pre-selected
                    console.log('Start timer for project:', project.id);
                  }}
                  disabled={isFocusActive} // Disable if focus timer is active
                  title={isFocusActive ? "Focus session in progress" : "Start timer for this project"}
                >
                  Start Timer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="mr-4 flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Delete "{projectToDelete?.name}"
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone. All time entries associated with this project will remain but will no longer be associated with any project.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProjectList;
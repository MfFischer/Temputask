import React, { useContext, useState, useRef, useEffect } from 'react';
import { TimeTrackingContext } from '../../contexts/TimeTrackingContext';
import { PlayIcon, StopIcon, FolderIcon, XMarkIcon } from '@heroicons/react/24/outline';

const QuickStartTimer = () => {
  const { activeTimer, startTimer, stopTimer, formatTime, projects } = useContext(TimeTrackingContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const projectSelectorRef = useRef(null);
  
  // Close project selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (projectSelectorRef.current && !projectSelectorRef.current.contains(event.target)) {
        setShowProjectSelector(false);
      }
    }
    
    // Bind event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [projectSelectorRef]);
  
  const handleAction = async () => {
    if (activeTimer) {
      // Stop active timer
      setIsLoading(true);
      try {
        await stopTimer();
      } catch (error) {
        console.error('Failed to stop timer:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If no timer, show project selector or start timer
      if (!showProjectSelector) {
        setShowProjectSelector(true);
      }
    }
  };
  
  const startTimerWithProject = async (projectId = null) => {
    setIsLoading(true);
    setShowProjectSelector(false);
    try {
      await startTimer(
        projectId,
        'Work', // Default category
        'Quick session', // Default description
        false, // No focus mode
        0 // No duration
      );
      setSelectedProject(projectId);
    } catch (error) {
      console.error('Timer action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!activeTimer || !activeTimer.start_time) return null;
    
    const startTime = new Date(activeTimer.start_time);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    return elapsed;
  };
  
  const elapsedTime = getElapsedTime();
  
  // Find selected project details
  const selectedProjectDetails = projects && selectedProject ? 
    projects.find(p => p.id === selectedProject) : null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {/* Project Selector */}
      {showProjectSelector && !activeTimer && (
        <div 
          ref={projectSelectorRef}
          className="absolute bottom-20 right-0 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 animate-slide-up"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Select Project</h3>
            <button 
              onClick={() => setShowProjectSelector(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <button
              onClick={() => startTimerWithProject(null)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center"
            >
              <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
              <span className="text-gray-700 dark:text-gray-300">No Project</span>
            </button>
            
            {projects && projects.map(project => (
              <button
                key={project.id}
                onClick={() => startTimerWithProject(project.id)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center"
              >
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: project.color || '#6366f1' }}
                ></span>
                <span className="text-gray-700 dark:text-gray-300 truncate">{project.name}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => startTimerWithProject(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-md text-sm font-medium"
            >
              Start without project
            </button>
          </div>
        </div>
      )}
      
      {/* Current project indicator */}
      {activeTimer && activeTimer.projects && (
        <div className="absolute -top-10 right-0 bg-white dark:bg-slate-800 rounded-full px-3 py-1 shadow-md flex items-center">
          <span 
            className="w-2 h-2 rounded-full mr-1"
            style={{ backgroundColor: activeTimer.projects.color || '#6366f1' }}
          ></span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
            {activeTimer.projects.name}
          </span>
        </div>
      )}
      
      {/* Timer value */}
      {activeTimer && elapsedTime !== null && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap shadow-md">
          {formatTime(elapsedTime)}
        </div>
      )}
      
      {/* Main FAB button */}
      <button
        onClick={handleAction}
        disabled={isLoading}
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all
          ${activeTimer 
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }
          ${isLoading ? 'opacity-70' : 'opacity-100'}
        `}
        aria-label={activeTimer ? "Stop timer" : "Start timer"}
      >
        {isLoading ? (
          <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : activeTimer ? (
          <StopIcon className="h-8 w-8" />
        ) : (
          <PlayIcon className="h-8 w-8" />
        )}
      </button>
      
      {/* Project selection indicator */}
      {!activeTimer && !showProjectSelector && (
        <button 
          onClick={() => setShowProjectSelector(true)}
          className="absolute -left-12 bottom-4 w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center"
          aria-label="Select project"
        >
          <FolderIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      )}
    </div>
  );
};

export default QuickStartTimer;
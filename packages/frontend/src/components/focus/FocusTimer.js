import React, { useState, useEffect, useContext } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import CustomTimerInput from './CustomTimerInput';
import DistractionPrompt from './DistractionPrompt';
import { useFocusContext } from '../../contexts/FocusContext';
import { TimeTrackingContext } from '../../contexts/TimeTrackingContext';
import { PlayIcon, PauseIcon, ClockIcon, StopIcon } from '@heroicons/react/24/outline';

const FocusTimer = ({ onDistracted }) => {
  const { 
    isActive, 
    isPaused, 
    startFocus, 
    pauseFocus, 
    resumeFocus, 
    stopFocus,
    selectedDuration,
    setSelectedDuration,
    remainingSeconds,
    formatTime,
    getCompletionPercentage,
    showDistractionPrompt,
    setShowDistractionPrompt
  } = useFocusContext();
  
  // Get projects and timer functions from TimeTrackingContext
  const { 
    projects, 
    activeTimer, 
    focusMode: globalFocusMode,
    startTimer, 
    stopTimer,
    pauseFocus: pauseGlobalFocus,
    resumeFocus: resumeGlobalFocus
  } = useContext(TimeTrackingContext);
  
  const [progress, setProgress] = useState(100);
  const [isCompactView, setIsCompactView] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [description, setDescription] = useState('');
  
  // Categories for time tracking - same as TimerWidget for consistency
  const categories = [
    'Coding',
    'Meeting',
    'Research',
    'Writing',
    'Email',
    'Learning',
    'Focus',
    'Other'
  ];
  
  const durations = [
    { value: 5, label: '5m' },
    { value: 15, label: '15m' },
    { value: 25, label: '25m' },
    { value: 45, label: '45m' },
    { value: 60, label: '60m' },
  ];

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsCompactView(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Set up event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Update progress when time changes
  useEffect(() => {
    setProgress(getCompletionPercentage());
  }, [remainingSeconds, getCompletionPercentage]);
  
  // Sync with global timer if a focus session is running
  useEffect(() => {
    if (activeTimer && globalFocusMode && !isActive) {
      // Extract focus duration from description if available
      const descRegex = /Focus Session \((\d+) min\)/;
      const match = activeTimer.description ? activeTimer.description.match(descRegex) : null;
      
      if (match && match[1]) {
        const focusMinutes = parseInt(match[1], 10);
        setSelectedDuration(focusMinutes);
      }
      
      // Set selected project if available
      if (activeTimer.project_id) {
        setSelectedProject(activeTimer.project_id);
      }
      
      // Set category if available
      if (activeTimer.category) {
        setSelectedCategory(activeTimer.category);
      }
      
      // Set description
      if (activeTimer.description) {
        setDescription(activeTimer.description);
      }
      
      // Start local focus timer
      startFocus();
    }
  }, [activeTimer, globalFocusMode, isActive, startFocus]);

  // Handle duration selection
  const handleDurationSelect = (value) => {
    if (!isActive) {
      setSelectedDuration(value);
    }
  };

  // Handle custom duration selection
  const handleCustomDuration = (minutes) => {
    if (!isActive && minutes > 0) {
      setSelectedDuration(minutes);
    }
  };

  // Handle project selection
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };
  
  // Handle category selection
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Start focus session
  const handleStartFocus = async () => {
    // If we have a selected project, use TimeTrackingContext to start a focus timer
    if (selectedProject || selectedCategory) {
      try {
        // Use 'Focus' as category if none selected
        const effectiveCategory = selectedCategory || 'Focus';
        
        // Start the timer in the global context
        await startTimer(
          selectedProject || null,
          effectiveCategory,
          description || `Focus Session (${selectedDuration} min)`,
          true,
          selectedDuration
        );
        
        // Also start the local focus timer
        startFocus();
      } catch (error) {
        console.error("Error starting focus timer:", error);
      }
    } else {
      // Just start the local focus timer without project tracking
      startFocus();
    }
  };

  // Toggle pause/resume
  const handlePauseResume = () => {
    if (isPaused) {
      resumeFocus();
      // Also resume in global context if there's an active timer
      if (activeTimer && globalFocusMode) {
        resumeGlobalFocus();
      }
    } else {
      // IMPORTANT: This sets isPaused to true AND showDistractionPrompt to true
      pauseFocus(true); // Make sure to pass true to show the distraction prompt
      
      // Also pause in global context if there's an active timer
      if (activeTimer && globalFocusMode) {
        pauseGlobalFocus();
      }
      
      // Notify parent if they want to handle distractions
      if (onDistracted) {
        onDistracted();
      }
    }
  };

  // Handle stopping the timer
  const handleStopFocus = async () => {
    stopFocus();
    
    // Also stop in global context if there's an active timer
    if (activeTimer && globalFocusMode) {
      await stopTimer();
    }
  };

  // Calculate circle properties for timer visualization
  const circleRadius = isCompactView ? 70 : 85;
  const circumference = 2 * Math.PI * circleRadius;
  const progressValue = 100 - progress; // Invert for proper display
  const strokeDashoffset = circumference * (1 - progressValue / 100);
  
  // Get project and category names for display
  const getProjectName = () => {
    if (!selectedProject || !projects) return null;
    const project = projects.find(p => p.id === selectedProject);
    return project ? project.name : 'Unknown project';
  };
  
  return (
    <Card className="overflow-hidden" animate>
      <div className={`p-${isCompactView ? '4' : '6'}`}>
        <h2 className={`text-${isCompactView ? 'lg' : 'xl'} font-semibold mb-${isCompactView ? '4' : '6'} text-center flex items-center justify-center`}>
          <ClockIcon className="h-5 w-5 mr-2 text-indigo-500" />
          Focus Timer
        </h2>
        
        <div className="flex justify-center mb-6">
          <div className={`relative w-${isCompactView ? '44' : '56'} h-${isCompactView ? '44' : '56'} flex items-center justify-center focus-timer-circle`}>
            {/* Background circle */}
            <svg className="absolute w-full h-full" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={circleRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-gray-200 dark:text-gray-700"
              />
            </svg>
            
            {/* Progress circle */}
            <svg 
              className="absolute w-full h-full transform -rotate-90"
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r={circleRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`
                  transition-all duration-1000 ease-linear
                  ${progressValue > 75 
                    ? 'text-green-500 dark:text-green-400' 
                    : progressValue > 30 
                      ? 'text-yellow-500 dark:text-yellow-400' 
                      : 'text-red-500 dark:text-red-400'
                  }
                `}
              />
            </svg>
            
            {/* Timer text */}
            <div className={`text-${isCompactView ? '4xl' : '5xl'} font-mono font-bold text-gray-800 dark:text-gray-100`}>
              {formatTime(remainingSeconds)}
            </div>
          </div>
        </div>
        
        {/* Duration selection - modified for better mobile experience */}
        {!isActive && (
          <div className={`flex justify-center flex-wrap gap-${isCompactView ? '1' : '2'} mb-${isCompactView ? '4' : '6'}`}>
            {durations.map(duration => (
              <button
                key={duration.value}
                onClick={() => handleDurationSelect(duration.value)}
                className={`
                  px-${isCompactView ? '2' : '3'} py-1 rounded-full text-${isCompactView ? 'xs' : 'sm'} font-medium transition-all duration-200
                  ${selectedDuration === duration.value
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
                  }
                `}
              >
                {duration.label}
              </button>
            ))}
            
            {/* Custom Timer Input - conditionally render based on available space */}
            {!isCompactView && (
              <CustomTimerInput 
                isActive={isActive}
                onSelectCustomTime={handleCustomDuration}
              />
            )}
          </div>
        )}
        
        {/* Distraction Prompt - Show when paused */}
        {isPaused && showDistractionPrompt ? (
          <div className="mt-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            <DistractionPrompt 
              onResume={() => {
                // This will be called when DistractionPrompt completes
                resumeFocus();
                if (activeTimer && globalFocusMode) {
                  resumeGlobalFocus();
                }
              }}
            />
          </div>
        ) : (
          <>
            {/* Project and category selection - only visible when not in active session */}
            {!isActive && (
              <div className="mb-4">
                {showDetailsForm ? (
                  <div className="space-y-3 animate-fade-in">
                    <select
                      value={selectedProject}
                      onChange={handleProjectChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a project (optional)</option>
                      {projects && projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a category (optional)</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What are you focusing on? (optional)"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                    
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setShowDetailsForm(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <button 
                      onClick={() => setShowDetailsForm(true)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Select project, category and add description
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Action buttons */}
            {isActive ? (
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleStopFocus}
                  className="w-1/3"
                  size={isCompactView ? "sm" : "md"}
                >
                  End
                </Button>
                
                <Button
                  variant={isPaused ? 'primary' : 'secondary'}
                  onClick={handlePauseResume}
                  icon={isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
                  className="w-2/3"
                  size={isCompactView ? "sm" : "md"}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                fullWidth
                animate
                size={isCompactView ? "md" : "lg"}
                icon={<PlayIcon className="h-5 w-5" />}
                onClick={handleStartFocus}
              >
                Start Focus {isCompactView ? "" : "Session"}
              </Button>
            )}
            
            {/* Add mobile-specific custom time input if in compact view */}
            {isCompactView && !isActive && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => {
                    const time = prompt("Enter custom focus time (in minutes):", "20");
                    const minutes = parseInt(time, 10);
                    if (!isNaN(minutes) && minutes > 0) {
                      handleCustomDuration(minutes);
                    }
                  }}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Set custom time
                </button>
              </div>
            )}
            
            {/* Show current project & category if active and has them */}
            {isActive && (selectedProject || selectedCategory) && (
              <div className="mt-4 text-center space-y-1">
                {selectedProject && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Project: <span className="font-medium">{getProjectName()}</span>
                  </div>
                )}
                {selectedCategory && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Category: <span className="font-medium">{selectedCategory}</span>
                  </div>
                )}
                {description && description !== `Focus Session (${selectedDuration} min)` && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Task: <span className="font-medium">{description}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default FocusTimer;
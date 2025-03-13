import React, { useState, useContext, useEffect, useRef } from 'react';
import { TimeTrackingContext } from '../../contexts/TimeTrackingContext';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
  PlayIcon, 
  StopIcon, 
  ClockIcon, 
  BoltIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const TimerWidget = () => {
  const { 
    activeTimer, 
    startTimer, 
    stopTimer,
    projects,
    focusMode,
    formatTime,
    getRemainingFocusTime
  } = useContext(TimeTrackingContext);
  
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [withFocus, setWithFocus] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingFocusTime, setRemainingFocusTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [advancedOptionsVisible, setAdvancedOptionsVisible] = useState(false);
  
  // Create a ref for the audio element
  const alarmRef = useRef(null);

  // Categories for time tracking
  const categories = [
    'Coding',
    'Meeting',
    'Research',
    'Writing',
    'Email',
    'Learning',
    'Other'
  ];

  // Check screen size on mount and on resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsCompactView(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize audio element
  useEffect(() => {
    // Create the audio element if it doesn't exist
    if (!alarmRef.current) {
      alarmRef.current = new Audio('/sounds/alarm.mp3');
      // Preload the audio
      alarmRef.current.load();
    }
    
    // Clean up function
    return () => {
      if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
      }
    };
  }, []);

  // Helper function to play alarm
  const playAlarm = () => {
    console.log("Attempting to play alarm sound");
    if (alarmRef.current) {
      // Set volume to ensure it's audible
      alarmRef.current.volume = 1.0;
      
      // Try to play the alarm
      const playPromise = alarmRef.current.play();
      
      // Handle potential play() promise rejection (browser may require user interaction)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error playing alarm sound:", error);
        });
      }
    } else {
      console.error("Alarm reference is not available");
    }
  };

  // Update elapsed time and focus time every second
  useEffect(() => {
    let interval = null;
    let timerEnded = false;
    
    if (activeTimer) {
      const startTime = new Date(activeTimer.start_time);
      
      interval = setInterval(() => {
        const now = new Date();
        // Update elapsed time
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Update remaining focus time
        if (focusMode) {
          const remaining = getRemainingFocusTime();
          setRemainingFocusTime(remaining);
          
          // If the focus time is up and we haven't already handled it
          if (remaining <= 0 && !timerEnded) {
            // Mark timer as ended to prevent multiple executions
            timerEnded = true;
            
            // Clear the interval immediately
            clearInterval(interval);
            interval = null;
            
            // Play the alarm
            playAlarm();
            
            // Wait a moment then stop the timer
            setTimeout(() => {
              stopTimer().catch(err => {
                console.error("Error stopping timer after focus period:", err);
              });
            }, 500);
          }
        }
      }, 1000);
    } else {
      setElapsedTime(0);
      setRemainingFocusTime(0);
      setFormVisible(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer, focusMode, getRemainingFocusTime, stopTimer]);

  const handleStartTimer = async () => {
    setIsSubmitting(true);
    
    try {
      await startTimer(
        selectedProject || null,
        selectedCategory || 'Other',
        description,
        withFocus,
        focusMinutes
      );
      
      // Reset form if successful
      setDescription('');
      setSelectedProject('');
      setSelectedCategory('');
      setWithFocus(false);
      setAdvancedOptionsVisible(false);
    } catch (error) {
      console.error("Error starting timer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopTimer = async () => {
    setIsSubmitting(true);
    
    try {
      await stopTimer();
      
      // Stop alarm if it's playing
      if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mobile optimized compact view for active timer
  const renderCompactActiveTimer = () => {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex-1 truncate">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {activeTimer.description || 'Tracking time'}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              {activeTimer.projects?.name && (
                <span className="flex items-center truncate">
                  <span 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: activeTimer.projects.color || '#6366f1' }}
                  ></span>
                  <span className="truncate">{activeTimer.projects.name}</span>
                </span>
              )}
              {activeTimer.category && (
                <>
                  {activeTimer.projects?.name && <span className="mx-1">•</span>}
                  <span className="truncate">{activeTimer.category}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-2xl font-mono font-bold px-3 py-1 rounded-lg text-gray-900 dark:text-white">
            {formatTime(elapsedTime)}
          </div>
        </div>
        
        {focusMode && (
          <div className="bg-indigo-50 dark:bg-slate-800/80 p-2 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <BoltIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mr-1" />
              <span className="text-indigo-700 dark:text-white text-sm font-medium">Focus</span>
            </div>
            <div className="text-indigo-600 dark:text-gray-300 font-mono font-medium text-sm">
              {formatTime(remainingFocusTime)}
            </div>
          </div>
        )}
        
        <Button
          variant="danger"
          fullWidth
          animate
          size="md"
          icon={<StopIcon className="h-5 w-5" />}
          onClick={handleStopTimer}
          isLoading={isSubmitting}
        >
          Stop Timer
        </Button>
      </div>
    );
  };

  // Mobile optimized compact view for timer form
  const renderCompactTimerForm = () => {
    return (
      <div className="space-y-4">
        {!formVisible ? (
          <div className="flex justify-center animate-fade-in">
            <Button
              variant="primary"
              size="md"
              animate
              icon={<PlayIcon className="h-5 w-5" />}
              onClick={() => setFormVisible(true)}
            >
              Start Timer
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="grid grid-cols-2 gap-3">
              <select
                id="project-mobile"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="select text-sm"
                aria-label="Select project"
              >
                <option value="">Select Project</option>
                {projects && projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              
              <select
                id="category-mobile"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select text-sm"
                aria-label="Select category"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <input
              type="text"
              id="description-mobile"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="input text-sm"
            />
            
            {/* Focus toggle with dropdown */}
            <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={withFocus}
                    onChange={(e) => setWithFocus(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-gray-900 dark:text-white text-sm">Focus Mode</span>
                </label>
                
                {withFocus && (
                  <select
                    value={focusMinutes}
                    onChange={(e) => setFocusMinutes(Number(e.target.value))}
                    className="text-sm bg-white dark:bg-slate-700 rounded p-1"
                  >
                    <option value="5">5 min</option>
                    <option value="15">15 min</option>
                    <option value="25">25 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </select>
                )}
              </div>
            </div>
            
            {/* Advanced options toggle */}
            <button
              type="button"
              onClick={() => setAdvancedOptionsVisible(!advancedOptionsVisible)}
              className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center w-full justify-center"
            >
              {advancedOptionsVisible ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-1" />
                  Hide Advanced Options
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                  Show Advanced Options
                </>
              )}
            </button>
            
            {/* Advanced options (placeholder) */}
            {advancedOptionsVisible && (
              <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced options will be available in a future update.
                </p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setFormVisible(false)}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                fullWidth
                animate
                size="md"
                icon={<PlayIcon className="h-5 w-5" />}
                onClick={handleStartTimer}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Start {withFocus ? "Focus" : "Timer"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden" animate>
      <div className={`p-${isCompactView ? '4' : '6'}`}>
        <h2 className={`text-${isCompactView ? 'lg' : 'xl'} font-semibold mb-${isCompactView ? '3' : '5'} text-gray-900 dark:text-white flex items-center`}>
          <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
            <ClockIcon className={`h-${isCompactView ? '4' : '5'} w-${isCompactView ? '4' : '5'} text-indigo-600 dark:text-indigo-400`} />
          </span>
          Time Tracker
        </h2>
        
        {isCompactView ? (
          // Mobile-optimized view
          activeTimer ? renderCompactActiveTimer() : renderCompactTimerForm()
        ) : (
          // Original desktop view (unchanged)
          activeTimer ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Task</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activeTimer.description || 'No description'}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {activeTimer.projects?.name && (
                      <span className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-1" 
                          style={{ backgroundColor: activeTimer.projects.color }}
                        ></span>
                        {activeTimer.projects.name}
                      </span>
                    )}
                    {activeTimer.category && (
                      <>
                        {activeTimer.projects?.name && <span className="mx-2">•</span>}
                        <span>{activeTimer.category}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-3xl font-mono font-bold bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-lg text-gray-900 dark:text-white">
                  {formatTime(elapsedTime)}
                </div>
              </div>
              
              {/* Focus mode indicator */}
              {focusMode && (
                <div className="bg-indigo-50 dark:bg-slate-800/80 p-3 rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <BoltIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                    <span className="text-indigo-700 dark:text-white font-medium">Focus Mode</span>
                  </div>
                  <div className="text-indigo-600 dark:text-gray-300 font-mono font-medium">
                    {formatTime(remainingFocusTime)}
                  </div>
                </div>
              )}
              
              <Button
                variant="danger"
                fullWidth
                animate
                icon={<StopIcon className="h-5 w-5" />}
                onClick={handleStopTimer}
                isLoading={isSubmitting}
              >
                Stop Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {!formVisible ? (
                <div className="flex justify-center animate-fade-in">
                  <Button
                    variant="primary"
                    size="lg"
                    animate
                    icon={<PlayIcon className="h-5 w-5" />}
                    onClick={() => setFormVisible(true)}
                  >
                    Start New Timer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Project
                      </label>
                      <select
                        id="project"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="select"
                      >
                        <option value="">Select a project</option>
                        {projects && projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="select"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What are you working on?"
                      className="input"
                    />
                  </div>
                  
                  {/* Focus mode option */}
                  <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={withFocus}
                          onChange={(e) => setWithFocus(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-gray-900 dark:text-white font-medium">Enable Focus Mode</span>
                      </label>
                      
                      {withFocus && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                          <select
                            value={focusMinutes}
                            onChange={(e) => setFocusMinutes(Number(e.target.value))}
                            className="bg-white dark:bg-slate-700 text-sm rounded-md border-gray-300 dark:border-slate-600"
                          >
                            <option value="5">5 min</option>
                            <option value="15">15 min</option>
                            <option value="25">25 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                          </select>
                        </div>
                      )}
                    </div>
                    
                    {withFocus && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Focus mode will help you stay on task for the selected duration.
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      variant="secondary"
                      onClick={() => setFormVisible(false)}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      variant="primary"
                      fullWidth
                      animate
                      icon={<PlayIcon className="h-5 w-5" />}
                      onClick={handleStartTimer}
                      isLoading={isSubmitting}
                      disabled={!selectedProject && !selectedCategory}
                    >
                      Start Timer {withFocus ? "with Focus" : ""}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </Card>
  );
};

export default TimerWidget;
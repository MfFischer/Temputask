import React, { useContext, useState } from 'react';
import { TimeTrackingContext } from '../../contexts/TimeTrackingContext';
import {
  PlayIcon,
  StopIcon,
  PauseIcon,
  ClockIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const MobileTimerControls = () => {
  const { 
    activeTimer, 
    startTimer, 
    stopTimer, 
    focusMode,
    pauseFocus,
    resumeFocus,
    isPaused,
    formatTime,
    getRemainingFocusTime
  } = useContext(TimeTrackingContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // No-op if there's no active timer
  if (!activeTimer) return null;
  
  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!activeTimer || !activeTimer.start_time) return 0;
    
    const startTime = new Date(activeTimer.start_time);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    return elapsed;
  };
  
  const handleStop = async () => {
    setIsLoading(true);
    try {
      await stopTimer();
    } catch (error) {
      console.error('Failed to stop timer:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFocusToggle = () => {
    if (isPaused) {
      resumeFocus();
    } else {
      pauseFocus();
    }
  };
  
  const remainingFocus = focusMode ? getRemainingFocusTime() : 0;
  const elapsedTime = getElapsedTime();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white dark:bg-slate-800 rounded-t-xl shadow-lg p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Timer info row with expand/collapse */}
        <div 
          className="flex items-center justify-between" 
          onClick={() => setShowDetails(!showDetails)}
        >
          <div>
            <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {activeTimer?.description || 'Tracking time'}
            </p>
          </div>
          
          <div className="flex space-x-3">
            {/* Focus mode toggle */}
            {focusMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFocusToggle();
                }}
                className={`rounded-full w-12 h-12 flex items-center justify-center ${
                  isPaused 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                }`}
                aria-label={isPaused ? "Resume focus" : "Pause focus"}
              >
                {isPaused ? (
                  <PlayIcon className="h-6 w-6" />
                ) : (
                  <PauseIcon className="h-6 w-6" />
                )}
              </button>
            )}
            
            {/* Stop button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStop();
              }}
              disabled={isLoading}
              className="rounded-full w-12 h-12 bg-red-600 text-white flex items-center justify-center"
              aria-label="Stop timer"
            >
              {isLoading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <StopIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Expanded details */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
            {/* Focus mode indicator */}
            {focusMode && (
              <div className="mb-2 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <BoltIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-1" />
                  <span className="text-indigo-700 dark:text-indigo-300 text-sm">Focus Mode</span>
                </div>
                <span className="text-indigo-700 dark:text-indigo-300 font-mono font-medium text-sm">
                  {formatTime(remainingFocus)}
                </span>
              </div>
            )}
            
            {/* Project & category info */}
            <div className="flex flex-wrap gap-2">
              {activeTimer.projects?.name && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700">
                  <span 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: activeTimer.projects.color || '#6366f1' }}
                  ></span>
                  <span>{activeTimer.projects.name}</span>
                </div>
              )}
              
              {activeTimer.category && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700">
                  {activeTimer.category}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTimerControls;
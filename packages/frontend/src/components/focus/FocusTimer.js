import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import CustomTimerInput from './CustomTimerInput';
import { useFocusContext } from '../../contexts/FocusContext';
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
    getCompletionPercentage
  } = useFocusContext();
  
  const [progress, setProgress] = useState(100);
  const [isCompactView, setIsCompactView] = useState(false);
  
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

  // Start focus session
  const handleStartFocus = async () => {
    await startFocus();
  };

  // Toggle pause/resume
  const handlePauseResume = () => {
    if (isPaused) {
      resumeFocus();
    } else {
      pauseFocus();
      // Notify parent if they want to handle distractions
      if (onDistracted) {
        onDistracted();
      }
    }
  };

  // Calculate circle properties for timer visualization
  const circleRadius = isCompactView ? 70 : 85;
  const circumference = 2 * Math.PI * circleRadius;
  const progressValue = 100 - progress; // Invert for proper display
  const strokeDashoffset = circumference * (1 - progressValue / 100);
  
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
                ${isActive ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={isActive}
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
        
        {/* Action buttons */}
        {isActive ? (
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={stopFocus}
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
      </div>
    </Card>
  );
};

export default FocusTimer;
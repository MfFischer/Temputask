
import React from 'react';
import { useFocusContext } from '../../contexts/FocusContext';
import Button from '../common/Button';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const MiniFocusTimer = () => {
  const { 
    isActive, 
    isPaused, 
    startFocus, 
    pauseFocus, 
    resumeFocus, 
    stopFocus,
    selectedDuration,
    remainingSeconds,
    formatTime
  } = useFocusContext();

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
      <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-2">
        Focus Mode
      </h3>
      
      {isActive ? (
        <div>
          <div className="mb-3 text-center">
            <span className="text-2xl font-mono font-bold text-indigo-800 dark:text-indigo-200">
              {formatTime(remainingSeconds)}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={stopFocus}
              className="flex-1"
            >
              End
            </Button>
            
            <Button
              variant={isPaused ? "primary" : "secondary"}
              size="sm"
              onClick={isPaused ? resumeFocus : pauseFocus}
              icon={isPaused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
              className="flex-1"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-center">
            <Link href="/focus" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Go to Focus Page
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-3">
            Start a {selectedDuration}-minute focus session
          </p>
          
          <Button
            variant="primary"
            size="sm"
            fullWidth
            icon={<PlayIcon className="h-4 w-4" />}
            onClick={startFocus}
          >
            Start Focus
          </Button>
          
          <div className="mt-2 text-xs text-center">
            <Link href="/focus" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Customize Timer
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniFocusTimer;
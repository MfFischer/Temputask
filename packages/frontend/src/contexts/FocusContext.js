import React, { createContext, useState, useContext, useEffect } from 'react';
import { TimeTrackingContext } from './TimeTrackingContext';

// Create the Focus Context
const FocusContext = createContext();

// Custom hook to use the Focus Context
export const useFocusContext = () => useContext(FocusContext);

// Focus Context Provider Component
export const FocusProvider = ({ children }) => {
  // State variables for focus session
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(null);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [endTime, setEndTime] = useState(null);
  
  // State for distraction prompt
  const [showDistractionPrompt, setShowDistractionPrompt] = useState(false);
  
  // Get TimeTrackingContext functions for synchronization
  const { 
    activeTimer, 
    focusMode: globalFocusMode, 
    focusEndTime: globalEndTime,
    isPaused: globalIsPaused,
    pauseFocus: pauseGlobalFocus,
    resumeFocus: resumeGlobalFocus,
    logDistraction: logGlobalDistraction
  } = useContext(TimeTrackingContext) || {};
  
  // Synchronize with global focus mode
  useEffect(() => {
    if (globalFocusMode && !isActive) {
      // The global context has an active focus session but our local context doesn't
      setIsActive(true);
      setIsPaused(globalIsPaused);
      
      if (globalEndTime) {
        const now = new Date();
        const totalSeconds = Math.max(0, Math.floor((globalEndTime - now) / 1000));
        
        // Calculate the selected duration based on the remaining time
        const calculatedDuration = Math.round(totalSeconds / 60);
        setSelectedDuration(calculatedDuration > 0 ? calculatedDuration : 25);
        
        // Calculate when the session started
        setStartTime(new Date(globalEndTime.getTime() - (selectedDuration * 60 * 1000)));
        setEndTime(globalEndTime);
      }
    } else if (!globalFocusMode && isActive) {
      // The global context has no active focus session but our local context does
      // Only reset if we didn't initiate the focus session locally
      if (activeTimer && activeTimer.category === 'Focus') {
        // This was a globally tracked focus session that ended
        stopFocus();
      }
    }
  }, [globalFocusMode, globalEndTime, globalIsPaused, isActive, activeTimer]);
  
  // Synchronize pause state
  useEffect(() => {
    if (globalFocusMode && isActive) {
      setIsPaused(globalIsPaused);
    }
  }, [globalIsPaused, globalFocusMode, isActive]);
  
  // Update remaining time when active
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        const now = new Date();
        let adjustedEndTime = endTime;
        
        // If we paused, we need to adjust the end time
        if (pausedDuration > 0) {
          adjustedEndTime = new Date(endTime.getTime() + pausedDuration);
          setEndTime(adjustedEndTime);
          setPausedDuration(0);
        }
        
        const remainingSecs = Math.max(0, Math.floor((adjustedEndTime - now) / 1000));
        setRemainingSeconds(remainingSecs);
        
        if (remainingSecs <= 0) {
          clearInterval(interval);
          // Auto-stop when timer reaches 0
          stopFocus();
        }
      }, 1000);
    } else if (!isActive) {
      setRemainingSeconds(selectedDuration * 60);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, endTime, pausedDuration, selectedDuration]);
  
  // Calculate the completion percentage
  const getCompletionPercentage = () => {
    if (!isActive) return 100;
    
    const totalSeconds = selectedDuration * 60;
    return Math.min(100, Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100));
  };
  
  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };
  
  // Start a focus session
  const startFocus = () => {
    const now = new Date();
    setStartTime(now);
    setEndTime(new Date(now.getTime() + selectedDuration * 60 * 1000));
    setRemainingSeconds(selectedDuration * 60);
    setIsActive(true);
    setIsPaused(false);
    setPausedDuration(0);
    setShowDistractionPrompt(false);
    return true;
  };
  
  // Pause a focus session and optionally show distraction prompt
  const pauseFocus = (showPrompt = true) => {
    if (isActive && !isPaused) {
      setIsPaused(true);
      setPausedTime(new Date());
      
      // Show distraction prompt if requested
      if (showPrompt) {
        setShowDistractionPrompt(true);
      }
      
      return true;
    }
    return false;
  };
  
  // Resume a paused focus session
  const resumeFocus = () => {
    if (isActive && isPaused) {
      const now = new Date();
      const pauseDurationMs = now - pausedTime;
      setPausedDuration(prevDuration => prevDuration + pauseDurationMs);
      setIsPaused(false);
      setShowDistractionPrompt(false);
      return true;
    }
    return false;
  };
  
  // Stop a focus session
  const stopFocus = () => {
    setIsActive(false);
    setIsPaused(false);
    setRemainingSeconds(selectedDuration * 60);
    setStartTime(null);
    setEndTime(null);
    setPausedTime(null);
    setPausedDuration(0);
    setShowDistractionPrompt(false);
    return true;
  };
  
  // Record a distraction
  const recordDistraction = async (description, minutes = 5) => {
    try {
      // Log to global tracking system
      if (logGlobalDistraction && typeof logGlobalDistraction === 'function') {
        await logGlobalDistraction(description, minutes);
      }
      
      // Resume focus session
      resumeFocus();
      
      return true;
    } catch (error) {
      console.error("Error logging distraction:", error);
      return false;
    }
  };
  
  // Context value
  const contextValue = {
    isActive,
    isPaused,
    selectedDuration,
    setSelectedDuration,
    remainingSeconds,
    startFocus,
    pauseFocus,
    resumeFocus,
    stopFocus,
    formatTime,
    getCompletionPercentage,
    recordDistraction,
    showDistractionPrompt,
    setShowDistractionPrompt
  };
  
  return (
    <FocusContext.Provider value={contextValue}>
      {children}
    </FocusContext.Provider>
  );
};

export default FocusContext;
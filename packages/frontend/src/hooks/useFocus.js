// packages/frontend/src/hooks/useFocus.js
import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { TimeTrackingContext } from '../contexts/TimeTrackingContext';

export function useFocus() {
  const { 
    timeEntries, 
    startTimer, 
    stopTimer, 
    activeTimer,
    logDistraction 
  } = useContext(TimeTrackingContext);
  
  // State
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(selectedDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [focusTimer, setFocusTimer] = useState(null);
  const [distractionCount, setDistractionCount] = useState(0);
  const [focusStats, setFocusStats] = useState({
    averageSession: 0,
    longestStreak: 0,
    sessionsToday: 0
  });
  
  // Refs
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const completedSessions = useRef([]);
  
  // Initialize audio and load saved sessions
  useEffect(() => {
    // Create an audio element for the alarm sound
    audioRef.current = new Audio('/sounds/alarm.mp3');
    
    // Add error handling for audio loading
    audioRef.current.addEventListener('error', () => {
      console.warn('Audio file not found, will use alert instead');
    });
    
    // Load completed sessions from localStorage
    try {
      const savedSessions = localStorage.getItem('focusCompletedSessions');
      if (savedSessions) {
        completedSessions.current = JSON.parse(savedSessions);
        calculateFocusStats();
      }
    } catch (error) {
      console.error('Error loading saved focus sessions:', error);
    }
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Calculate focus statistics
  const calculateFocusStats = useCallback(() => {
    if (completedSessions.current.length === 0) {
      setFocusStats({
        averageSession: 0,
        longestStreak: 0,
        sessionsToday: 0
      });
      return;
    }
    
    // Calculate average session duration (in minutes)
    const totalDuration = completedSessions.current.reduce(
      (sum, session) => sum + session.duration, 0
    );
    const averageSession = Math.round(totalDuration / completedSessions.current.length);
    
    // Find longest streak (in minutes)
    const longestStreak = Math.max(
      ...completedSessions.current.map(session => session.duration)
    );
    
    // Count sessions today
    const today = new Date().toISOString().split('T')[0];
    const sessionsToday = completedSessions.current.filter(
      session => session.completedAt.split('T')[0] === today
    ).length;
    
    setFocusStats({
      averageSession,
      longestStreak,
      sessionsToday
    });
  }, []);
  
  // Check if there's an active focus timer
  useEffect(() => {
    // Look for an active focus timer in time entries
    const activeFocus = timeEntries.find(entry => 
      entry.category === 'Focus' && !entry.end_time
    );
    
    // If found, set as current focus timer
    if (activeFocus) {
      setFocusTimer(activeFocus);
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setFocusTimer(null);
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [timeEntries]);
  
  // Timer countdown effect
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isRunning && !isPaused && focusTimer) {
      const startTime = new Date(focusTimer.start_time);
      const duration = selectedDuration * 60;
      
      // Calculate elapsed and remaining time
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsedSeconds);
        
        setRemainingSeconds(remaining);
        
        // Auto-stop when timer reaches zero
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          playAlarmSound();
          handleTimerComplete();
        }
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, focusTimer, selectedDuration]);
  
  // Play alarm sound when timer completes
  const playAlarmSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {
          console.warn('Could not play alarm sound:', e);
          // Fallback to alert
          alert('Focus timer completed!');
        });
      } else {
        // Fallback if audio isn't initialized
        alert('Focus timer completed!');
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      alert('Focus timer completed!');
    }
  };
  
  // Handle timer completion
  const handleTimerComplete = async () => {
    // Record successful session
    const newSession = {
      id: Date.now().toString(),
      duration: selectedDuration,
      completedAt: new Date().toISOString(),
      wasSuccessful: true
    };
    
    completedSessions.current = [...completedSessions.current, newSession];
    
    // Save to localStorage
    try {
      localStorage.setItem(
        'focusCompletedSessions', 
        JSON.stringify(completedSessions.current)
      );
    } catch (error) {
      console.error('Error saving focus session:', error);
    }
    
    // Update statistics
    calculateFocusStats();
    
    // Stop the timer in the TimeTrackingContext
    await stopFocus();
  };
  
  // Start a focus session
  const startFocus = async () => {
    // Check if there's a non-focus timer running
    if (activeTimer && activeTimer.category !== 'Focus') {
      // Stop the existing project timer first
      try {
        await stopTimer();
      } catch (error) {
        console.error('Error stopping current timer:', error);
        return false;
      }
    }
    
    try {
      // Start a new focus timer
      const timer = await startTimer(
        null, // No project ID for focus timer
        'Focus', // Category
        `Focus Session (${selectedDuration} min)` // Description
      );
      
      if (timer) {
        setFocusTimer(timer);
        setIsRunning(true);
        setIsPaused(false);
        setRemainingSeconds(selectedDuration * 60);
        return true;
      }
    } catch (error) {
      console.error('Error starting focus session:', error);
    }
    
    return false;
  };
  
  // Stop the focus session
  const stopFocus = async () => {
    if (!focusTimer) return false;
    
    try {
      await stopTimer();
      setFocusTimer(null);
      setIsRunning(false);
      setIsPaused(false);
      return true;
    } catch (error) {
      console.error('Error stopping focus session:', error);
      return false;
    }
  };
  
  // Pause the focus session
  const pauseFocus = () => {
    setIsPaused(true);
  };
  
  // Resume the focus session
  const resumeFocus = () => {
    setIsPaused(false);
  };
  
  // Record a distraction during focus
  const recordDistraction = async (description) => {
    if (!focusTimer) return false;
    
    try {
      await logDistraction(description || 'Unspecified distraction', 1);
      setDistractionCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error logging distraction:', error);
      return false;
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format time for display (e.g., "2 hours 15 minutes" or "45 minutes")
  const formatTimeString = (minutes) => {
    if (!minutes) return '0 minutes';
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
      }
    }
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!focusTimer || selectedDuration <= 0) return 0;
    const totalSeconds = selectedDuration * 60;
    const elapsedSeconds = totalSeconds - remainingSeconds;
    return Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100));
  };
  
  // Check if a project timer can be started (i.e., no focus timer running)
  const canStartProjectTimer = !focusTimer;
  
  return {
    // State
    focusTimer,
    selectedDuration,
    remainingSeconds,
    isRunning,
    isPaused,
    distractionCount,
    canStartProjectTimer,
    focusStats,
    
    // Actions
    setSelectedDuration,
    startFocus,
    stopFocus,
    pauseFocus,
    resumeFocus,
    recordDistraction,
    
    // Utilities
    formatTime,
    formatTimeString,
    getCompletionPercentage,
    
    // For compatibility with existing code
    focusState: { isActive: isRunning, isPaused },
    isActive: isRunning,
    endFocus: stopFocus
  };
}

export default useFocus;
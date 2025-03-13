import { createContext, useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { formatDuration, getStartOfDay, isToday } from '@tempos-ai/shared';

export const TimeTrackingContext = createContext();

export function TimeTrackingProvider({ children }) {
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalTracked: 0,
    productive: 0,
    distracted: 0,
    categories: {},
  });
  
  // Focus mode states
  const [focusMode, setFocusMode] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [focusEndTime, setFocusEndTime] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  
  const supabase = useSupabaseClient();
  const user = useUser();

  // Load projects on mount
  useEffect(() => {
    if (!user) return;

    async function loadProjects() {
      try {
        const response = await fetch('/api/timeTracking/getProjects');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load projects');
        }
        
        setProjects(data || []);
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    }

    loadProjects();
  }, [user]);

  // Load time entries for today
  useEffect(() => {
    if (!user) return;
    
    async function loadTimeEntries() {
      setIsLoading(true);
      
      try {
        // Check for active timer
        const response = await fetch('/api/timeTracking/getActiveTimer');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch active timer');
        }
        
        const activeTimerData = data.activeTimer;
        
        if (activeTimerData) {
          console.log('Found active timer:', activeTimerData);
          setActiveTimer(activeTimerData);
          
          // Check if this is a focus timer
          if (activeTimerData.category === 'Focus') {
            setFocusMode(true);
            
            // If this is a focus timer, figure out when it should end
            const descRegex = /Focus Session \((\d+) min\)/;
            const match = activeTimerData.description ? activeTimerData.description.match(descRegex) : null;
            
            if (match && match[1]) {
              const focusMinutes = parseInt(match[1], 10);
              setFocusDuration(focusMinutes);
              
              const startTime = new Date(activeTimerData.start_time);
              const endTime = new Date(startTime.getTime() + (focusMinutes * 60 * 1000));
              setFocusEndTime(endTime);
              
              console.log(`Resumed focus timer: ${focusMinutes} minutes, ends at ${endTime.toISOString()}`);
            } else {
              setFocusDuration(25);
              
              const startTime = new Date(activeTimerData.start_time);
              const endTime = new Date(startTime.getTime() + (25 * 60 * 1000));
              setFocusEndTime(endTime);
            }
          } else {
            setFocusMode(false);
            setFocusEndTime(null);
          }
        } else {
          setActiveTimer(null);
          setFocusMode(false);
          setFocusEndTime(null);
          setIsPaused(false);
        }

        // Get today's entries from API
        const entriesResponse = await fetch('/api/timeTracking/getTimeEntries');
        const entriesData = await entriesResponse.json();
        
        if (!entriesResponse.ok) {
          throw new Error(entriesData.error || 'Failed to fetch time entries');
        }

        setTimeEntries(entriesData.timeEntries || []);
        calculateSummary(entriesData.timeEntries || []);
      } catch (err) {
        console.error('Error loading time entries:', err);
        setError('Failed to load time entries');
      } finally {
        setIsLoading(false);
      }
    }

    loadTimeEntries();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('time_entries_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'time_entries',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        console.log('Time entry changed, reloading data...');
        loadTimeEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // Calculate summary statistics
  const calculateSummary = (entries) => {
    if (!entries || !entries.length) {
      setSummary({
        totalTracked: 0,
        productive: 0,
        distracted: 0,
        categories: {},
      });
      return;
    }

    const summary = {
      totalTracked: 0,
      productive: 0,
      distracted: 0,
      categories: {},
    };

    entries.forEach(entry => {
      if (!entry.duration) return;
      
      // Add to total duration
      summary.totalTracked += entry.duration;
      
      // Add to category duration
      const category = entry.category || 'Other';
      if (!summary.categories[category]) {
        summary.categories[category] = 0;
      }
      summary.categories[category] += entry.duration;
      
      // Add to productive or distracted
      if (category === 'Distraction') {
        summary.distracted += entry.duration;
      } else {
        summary.productive += entry.duration;
      }
    });

    setSummary(summary);
  };

  // Start a new timer
  const startTimer = async (projectId, category, description = '', withFocus = false, focusMinutes = 25) => {
    if (!user) return null;
    
    console.log('Starting timer:', { projectId, category, description, withFocus, focusMinutes });
    
    try {
      // If requesting a focus timer, set category to 'Focus'
      const effectiveCategory = withFocus ? 'Focus' : category;
      const effectiveDescription = withFocus ? `Focus Session (${focusMinutes} min)` : description;
      
      const response = await fetch('/api/timeTracking/startTimer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          category: effectiveCategory,
          description: effectiveDescription,
          duration_minutes: withFocus ? focusMinutes : null
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to start timer');
      }

      console.log('Timer started successfully:', responseData.data);
      
      // Store the timer data
      setActiveTimer(responseData.data);
      
      // If focus mode was requested, set up focus states
      if (withFocus) {
        setFocusMode(true);
        setFocusDuration(focusMinutes);
        setIsPaused(false);
        
        // Calculate when focus session should end
        const now = new Date();
        const endTime = new Date(now.getTime() + focusMinutes * 60 * 1000);
        setFocusEndTime(endTime);
        
        console.log(`Focus timer started: ${focusMinutes} minutes, ends at ${endTime.toISOString()}`);
      } else {
        setFocusMode(false);
        setFocusEndTime(null);
      }
      
      return responseData.data;
    } catch (err) {
      console.error('Error starting timer:', err);
      setError('Failed to start timer');
      return null;
    }
  };

  // Start a focus session
  const startFocus = async (projectId = null, description = 'Focus Session', durationMinutes = 25) => {
    return startTimer(projectId, 'Focus', description, true, durationMinutes);
  };

  // Stop the active timer
  const stopTimer = async () => {
    if (!user || !activeTimer) return null;
    
    console.log('Stopping timer with ID:', activeTimer.id);
    
    try {
      const response = await fetch('/api/timeTracking/stopTimer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry_id: activeTimer.id,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to stop timer');
      }

      console.log('Timer stopped successfully:', responseData.data);
      setActiveTimer(null);
      setFocusMode(false);
      setFocusEndTime(null);
      setIsPaused(false);
      
      return responseData.data;
    } catch (err) {
      console.error('Error stopping timer:', err);
      setError('Failed to stop timer');
      return null;
    }
  };

  // Pause a focus session
  const pauseFocus = () => {
    if (focusMode && !isPaused) {
      setIsPaused(true);
      return true;
    }
    return false;
  };

  // Resume a paused focus session
  const resumeFocus = () => {
    if (focusMode && isPaused) {
      setIsPaused(false);
      return true;
    }
    return false;
  };

  // Log a distraction
  const logDistraction = async (description, durationMinutes) => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/timeTracking/logDistraction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          duration_minutes: durationMinutes,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to log distraction');
      }

      setDistractionCount(prev => prev + 1);
      return responseData.data;
    } catch (err) {
      console.error('Error logging distraction:', err);
      setError('Failed to log distraction');
      return null;
    }
  };

  // Find peak productivity hour
  const getPeakHour = () => {
    if (!timeEntries.length) {
      return null;
    }

    // Create an array of 24 hours
    const hourCounts = Array(24).fill(0);
    
    // Exclude distractions
    const productiveEntries = timeEntries.filter(entry => 
      entry.category !== 'Distraction' && entry.duration);
    
    // Sum up time for each hour
    productiveEntries.forEach(entry => {
      const startHour = new Date(entry.start_time).getHours();
      hourCounts[startHour] += entry.duration;
    });
    
    // Find the hour with maximum time
    const maxDuration = Math.max(...hourCounts);
    const peakHour = hourCounts.indexOf(maxDuration);
    
    return {
      hour: peakHour,
      duration: maxDuration,
      formatted: formatDuration(maxDuration),
    };
  };

  // Calculate average task duration by category
  const getAverageTaskDuration = (category) => {
    if (!timeEntries.length) {
      return null;
    }
    
    // Filter by category and ensure tasks are completed
    const filteredEntries = timeEntries.filter(entry => 
      (!category || entry.category === category) && 
      entry.duration && 
      entry.category !== 'Distraction');
      
    if (!filteredEntries.length) {
      return null;
    }
    
    // Calculate average
    const totalDuration = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const avgDuration = Math.round(totalDuration / filteredEntries.length);
    
    return {
      seconds: avgDuration,
      formatted: formatDuration(avgDuration),
    };
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

  // Calculate remaining focus time
  const getRemainingFocusTime = () => {
    if (!focusMode || !focusEndTime) return 0;
    
    const now = new Date();
    const remaining = Math.max(0, Math.floor((focusEndTime - now) / 1000));
    console.log(`Remaining focus time: ${remaining} seconds`);
    return remaining;
  };

  // Calculate completion percentage for focus timer
  const getFocusCompletionPercentage = () => {
    if (!focusMode || !focusEndTime || !focusDuration) return 0;
    
    const totalSeconds = focusDuration * 60;
    const remainingSeconds = getRemainingFocusTime();
    const elapsedSeconds = totalSeconds - remainingSeconds;
    
    return Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100));
  };

  const value = {
    // General time tracking
    activeTimer,
    timeEntries,
    projects,
    isLoading,
    error,
    summary,
    startTimer,
    stopTimer,
    logDistraction,
    getPeakHour,
    getAverageTaskDuration,
    
    // Focus mode
    focusMode,
    focusDuration,
    focusEndTime,
    isPaused,
    distractionCount,
    startFocus,
    pauseFocus,
    resumeFocus,
    getRemainingFocusTime,
    getFocusCompletionPercentage,
    formatTime
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
}
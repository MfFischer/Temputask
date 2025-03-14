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

  // Load projects directly from Supabase instead of API route
  useEffect(() => {
    if (!user) return;

    async function loadProjects() {
      try {
        // Direct Supabase query instead of API route
        const { data, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, description, color, company_id')
          .eq('user_id', user.id);
        
        if (projectsError) {
          throw new Error(projectsError.message || 'Failed to load projects');
        }
        
        setProjects(data || []);
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    }

    loadProjects();
  }, [user, supabase]);

  // Load time entries for today directly from Supabase
  useEffect(() => {
    if (!user) return;
    
    async function loadTimeEntries() {
      setIsLoading(true);
      
      try {
        // Check for active timer directly with Supabase
        const { data: activeTimerData, error: activeTimerError } = await supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', user.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1)
          .single();
        
        if (activeTimerError && activeTimerError.code !== 'PGRST116') {
          // PGRST116 is the error code for "no rows returned" which is expected if no active timer
          throw new Error(activeTimerError.message || 'Failed to fetch active timer');
        }
        
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

        // Get today's entries from Supabase
        const startOfDay = getStartOfDay(new Date()).toISOString();
        
        const { data: entriesData, error: entriesError } = await supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', startOfDay)
          .order('start_time', { ascending: false });
        
        if (entriesError) {
          throw new Error(entriesError.message || 'Failed to fetch time entries');
        }

        setTimeEntries(entriesData || []);
        calculateSummary(entriesData || []);
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

  // Start a new timer directly with Supabase
  const startTimer = async (projectId, category, description = '', withFocus = false, focusMinutes = 25) => {
    if (!user) return null;
    
    console.log('Starting timer:', { projectId, category, description, withFocus, focusMinutes });
    
    try {
      // If requesting a focus timer, set category to 'Focus'
      const effectiveCategory = withFocus ? 'Focus' : category;
      const effectiveDescription = withFocus ? `Focus Session (${focusMinutes} min)` : description;
      
      const now = new Date();
      
      // Insert the time entry directly with Supabase
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          project_id: projectId,
          category: effectiveCategory,
          description: effectiveDescription,
          start_time: now.toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to start timer');
      }

      console.log('Timer started successfully:', data);
      
      // Store the timer data
      setActiveTimer(data);
      
      // If focus mode was requested, set up focus states
      if (withFocus) {
        setFocusMode(true);
        setFocusDuration(focusMinutes);
        setIsPaused(false);
        
        // Calculate when focus session should end
        const endTime = new Date(now.getTime() + focusMinutes * 60 * 1000);
        setFocusEndTime(endTime);
        
        console.log(`Focus timer started: ${focusMinutes} minutes, ends at ${endTime.toISOString()}`);
      } else {
        setFocusMode(false);
        setFocusEndTime(null);
      }
      
      return data;
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

  // Stop the active timer directly with Supabase
  const stopTimer = async () => {
    if (!user || !activeTimer) return null;
    
    console.log('Stopping timer with ID:', activeTimer.id);
    
    try {
      const now = new Date();
      const startTime = new Date(activeTimer.start_time);
      const duration = Math.round((now - startTime) / 1000); // duration in seconds
      
      // Update the time entry directly with Supabase
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          end_time: now.toISOString(),
          duration: duration
        })
        .eq('id', activeTimer.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to stop timer');
      }

      console.log('Timer stopped successfully:', data);
      setActiveTimer(null);
      setFocusMode(false);
      setFocusEndTime(null);
      setIsPaused(false);
      
      return data;
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

  // Log a distraction directly with Supabase
  const logDistraction = async (description, durationMinutes) => {
    if (!user) return null;
    
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - (durationMinutes * 60 * 1000));
      const duration = durationMinutes * 60; // convert to seconds
      
      // Insert the distraction entry directly with Supabase
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          category: 'Distraction',
          description: description,
          start_time: startTime.toISOString(),
          end_time: now.toISOString(),
          duration: duration
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to log distraction');
      }

      setDistractionCount(prev => prev + 1);
      return data;
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
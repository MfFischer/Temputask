import { useState, useEffect, useContext } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AuthContext } from '../contexts/AuthContext';

export function useTimeTracking() {
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();
  const { user } = useContext(AuthContext);

  // Load time entries for today
  useEffect(() => {
    if (!user) return;
    
    async function loadTimeEntries() {
      setIsLoading(true);
      
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        // Check for active timer
        const { data: activeTimerData, error: activeTimerError } = await supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', user.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1)
          .single();

        if (activeTimerError && activeTimerError.code !== 'PGRST116') {
          console.error('Error fetching active timer:', activeTimerError);
        } else if (activeTimerData) {
          setActiveTimer(activeTimerData);
        }

        // Fetch all time entries for today
        const { data, error } = await supabase
          .from('time_entries')
          .select(`
            id,
            project_id,
            category,
            description,
            start_time,
            end_time,
            duration,
            projects(name, color)
          `)
          .eq('user_id', user.id)
          .gte('start_time', today.toISOString())
          .order('start_time', { ascending: false });

        if (error) {
          throw error;
        }

        setTimeEntries(data || []);
      } catch (err) {
        console.error('Error loading time entries:', err);
        setError('Failed to load time entries');
      } finally {
        setIsLoading(false);
      }
    }

    loadTimeEntries();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('time_entries_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'time_entries',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        loadTimeEntries();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabase]);

  // Start a new timer
  const startTimer = async (projectId, category, description = '') => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/timeTracking/startTimer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          category,
          description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start timer');
      }

      const { data } = await response.json();
      setActiveTimer(data);
      return data;
    } catch (err) {
      console.error('Error starting timer:', err);
      setError('Failed to start timer');
      return null;
    }
  };

  // Stop the active timer
  const stopTimer = async () => {
    if (!user || !activeTimer) return;
    
    try {
      const response = await fetch('/api/timeTracking/stopTimer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
        },
        body: JSON.stringify({
          entry_id: activeTimer.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to stop timer');
      }

      const { data } = await response.json();
      setActiveTimer(null);
      return data;
    } catch (err) {
      console.error('Error stopping timer:', err);
      setError('Failed to stop timer');
      return null;
    }
  };

  // Log a distraction
  const logDistraction = async (description, durationMinutes) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/timeTracking/logDistraction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
        },
        body: JSON.stringify({
          description,
          duration_minutes: durationMinutes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to log distraction');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      console.error('Error logging distraction:', err);
      setError('Failed to log distraction');
      return null;
    }
  };

  // Calculate summary statistics
  const getSummary = () => {
    if (!timeEntries.length) {
      return {
        totalTracked: 0,
        productive: 0,
        distracted: 0,
        categories: {},
      };
    }

    const summary = {
      totalTracked: 0,
      productive: 0,
      distracted: 0,
      categories: {},
    };

    timeEntries.forEach(entry => {
      if (!entry.duration) return;
      
      // Add to total duration
      summary.totalTracked += entry.duration;
      
      // Add to category duration
      if (!summary.categories[entry.category]) {
        summary.categories[entry.category] = 0;
      }
      summary.categories[entry.category] += entry.duration;
      
      // Add to productive or distracted
      if (entry.category === 'Distraction') {
        summary.distracted += entry.duration;
      } else {
        summary.productive += entry.duration;
      }
    });

    return summary;
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
    };
  };

  return {
    activeTimer,
    timeEntries,
    isLoading,
    error,
    startTimer,
    stopTimer,
    logDistraction,
    getSummary,
    getPeakHour,
  };
}

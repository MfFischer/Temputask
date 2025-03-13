import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Button from '../common/Button';

ChartJS.register(ArcElement, Tooltip, Legend);

const TimeDistributionChart = ({ dateRange, filters }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localDateRange, setLocalDateRange] = useState(dateRange || 'week');
  const supabase = useSupabaseClient();
  const user = useUser();

  // Update local state when prop changes
  useEffect(() => {
    if (dateRange) {
      setLocalDateRange(dateRange);
    }
  }, [dateRange]);

  // Load data
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, you would fetch actual time entries from your database
        // Here we'll simulate some data based on the date range and filters
        
        // Fetch time entries for date range
        const { data: timeEntries, error } = await supabase
          .from('time_entries')
          .select(`
            id,
            start_time,
            end_time,
            duration,
            project_id,
            projects(name, color, company_id, companies(name)),
            activity_id,
            activities(name),
            billable
          `)
          .eq('user_id', user.id)
          .gte('start_time', getStartDate(localDateRange).toISOString())
          .lte('end_time', getEndDate(localDateRange).toISOString());
        
        if (error) throw error;

        // Apply filters
        let filteredEntries = timeEntries || [];
        
        if (filters && filters.project) {
          filteredEntries = filteredEntries.filter(entry => 
            entry.project_id === filters.project
          );
        }
        
        if (filters && filters.company) {
          filteredEntries = filteredEntries.filter(entry => 
            entry.projects?.company_id === filters.company
          );
        }
        
        if (filters && filters.billable === 'billable') {
          filteredEntries = filteredEntries.filter(entry => entry.billable);
        } else if (filters && filters.billable === 'non-billable') {
          filteredEntries = filteredEntries.filter(entry => !entry.billable);
        }
        
        // If no data, provide sample data
        if (!filteredEntries.length) {
          // Sample data
          const data = {
            labels: ['Development', 'Design', 'Meetings', 'Research', 'Admin'],
            datasets: [
              {
                data: [42, 18, 15, 15, 10],
                backgroundColor: [
                  '#3B82F6', // blue
                  '#10B981', // green
                  '#F59E0B', // amber
                  '#8B5CF6', // purple
                  '#6B7280', // gray
                ],
                borderWidth: 1,
              },
            ],
          };
          setChartData(data);
          return;
        }
        
        // Aggregate by project or activity
        const projectTotals = {};
        
        filteredEntries.forEach(entry => {
          const projectName = entry.projects?.name || 'Unknown Project';
          const projectColor = entry.projects?.color || '#3B82F6';
          
          if (!projectTotals[projectName]) {
            projectTotals[projectName] = {
              duration: 0,
              color: projectColor
            };
          }
          
          projectTotals[projectName].duration += entry.duration || 0;
        });
        
        // Convert to chart data format
        const labels = Object.keys(projectTotals);
        const durations = labels.map(label => projectTotals[label].duration);
        const colors = labels.map(label => projectTotals[label].color);
        
        setChartData({
          labels,
          datasets: [
            {
              data: durations,
              backgroundColor: colors,
              borderWidth: 1,
            },
          ],
        });
        
      } catch (err) {
        console.error('Error loading time distribution data:', err);
        setError('Failed to load time distribution data');
        
        // Provide sample data on error
        const sampleData = {
          labels: ['Development', 'Design', 'Meetings', 'Research', 'Admin'],
          datasets: [
            {
              data: [42, 18, 15, 15, 10],
              backgroundColor: [
                '#3B82F6', // blue
                '#10B981', // green
                '#F59E0B', // amber
                '#8B5CF6', // purple
                '#6B7280', // gray
              ],
              borderWidth: 1,
            },
          ],
        };
        setChartData(sampleData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, localDateRange, filters, supabase]);

  // Helper function to get start date based on date range
  const getStartDate = (range) => {
    const now = new Date();
    let startDate = new Date(now);
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
    }
    
    return startDate;
  };
  
  // Helper function to get end date based on date range
  const getEndDate = (range) => {
    const now = new Date();
    let endDate = new Date(now);
    
    switch (range) {
      case 'today':
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        endDate.setDate(now.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        endDate.setDate(now.getDate() + (6 - now.getDay()));
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        endDate.setHours(23, 59, 59, 999);
    }
    
    return endDate;
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            // Format duration in hours and minutes
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            return `${context.label}: ${hours}h ${minutes}m`;
          },
        },
      },
    },
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error}
      </div>
    );
  }
  
  if (!chartData) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        No data available for the selected time period
      </div>
    );
  }
  
  // Date filter buttons - this handles the filtering internally 
  // rather than through the parent component
  const dateFilterButtons = (
    <div className="flex space-x-2 mb-4">
      <Button
        variant={localDateRange === 'today' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setLocalDateRange('today')}
      >
        Today
      </Button>
      <Button
        variant={localDateRange === 'yesterday' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setLocalDateRange('yesterday')}
      >
        Yesterday
      </Button>
      <Button
        variant={localDateRange === 'week' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setLocalDateRange('week')}
      >
        This Week
      </Button>
      <Button
        variant={localDateRange === 'month' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setLocalDateRange('month')}
      >
        This Month
      </Button>
    </div>
  );
  
  return (
    <div className="flex flex-col h-full">
      {dateFilterButtons}
      <div className="flex-grow">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TimeDistributionChart;
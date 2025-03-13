import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

const ProductivityChart = ({ dateRange, filters }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();
  const user = useUser();

  // Load data
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, you would fetch productivity data from your database
        // Here we'll simulate some data based on the date range
        
        // Generate date labels based on date range
        const days = [];
        const currentDate = new Date(dateRange.startDate);
        while (currentDate <= dateRange.endDate) {
          days.push(new Date(currentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Fetch actual time entries for the date range
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
          .gte('start_time', dateRange.startDate.toISOString())
          .lte('end_time', dateRange.endDate.toISOString());
        
        if (error) throw error;
        
        // Apply filters
        let filteredEntries = timeEntries || [];
        
        if (filters.project) {
          filteredEntries = filteredEntries.filter(entry => 
            entry.project_id === filters.project
          );
        }
        
        if (filters.company) {
          filteredEntries = filteredEntries.filter(entry => 
            entry.projects?.company_id === filters.company
          );
        }
        
        if (filters.billable === 'billable') {
          filteredEntries = filteredEntries.filter(entry => entry.billable);
        } else if (filters.billable === 'non-billable') {
          filteredEntries = filteredEntries.filter(entry => !entry.billable);
        }
        
        // If no real data, generate sample data
        if (!filteredEntries.length) {
          // Generate sample productive hours
          const productiveHours = days.map(() => Math.random() * 4 + 2); // 2-6 hours
          
          // Generate sample distraction hours (roughly 10-30% of productive time)
          const distractionHours = productiveHours.map(hours => hours * (Math.random() * 0.2 + 0.1));
          
          setChartData({
            labels: days,
            datasets: [
              {
                label: 'Productive Time',
                data: productiveHours,
                borderColor: '#10B981', // green
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                fill: true,
              },
              {
                label: 'Distraction Time',
                data: distractionHours,
                borderColor: '#EF4444', // red
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.3,
                fill: true,
              }
            ],
          });
          return;
        }
        
        // Organize data by day
        const dailyData = {};
        days.forEach(day => {
          dailyData[day] = { productive: 0, distraction: 0 };
        });
        
        // Process entries
        filteredEntries.forEach(entry => {
          const entryDate = new Date(entry.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (dailyData[entryDate]) {
            // Determine if the entry is productive or a distraction
            // This would be based on your app's logic
            const isDistraction = entry.projects?.name?.toLowerCase().includes('distraction') || 
                                 entry.activities?.name?.toLowerCase().includes('distraction');
            
            if (isDistraction) {
              dailyData[entryDate].distraction += entry.duration / 3600; // Convert seconds to hours
            } else {
              dailyData[entryDate].productive += entry.duration / 3600; // Convert seconds to hours
            }
          }
        });
        
        // Extract data for chart
        const productiveData = days.map(day => dailyData[day].productive);
        const distractionData = days.map(day => dailyData[day].distraction);
        
        setChartData({
          labels: days,
          datasets: [
            {
              label: 'Productive Time',
              data: productiveData,
              borderColor: '#10B981', // green
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Distraction Time',
              data: distractionData,
              borderColor: '#EF4444', // red
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.3,
              fill: true,
            }
          ],
        });
        
      } catch (err) {
        console.error('Error loading productivity data:', err);
        setError('Failed to load productivity data');
        
        // Provide sample data on error
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const productiveHours = [4.2, 5.1, 3.8, 4.5, 5.8, 2.1, 1.5];
        const distractionHours = [0.8, 1.2, 0.7, 1.3, 0.9, 0.3, 0.2];
        
        setChartData({
          labels: days,
          datasets: [
            {
              label: 'Productive Time',
              data: productiveHours,
              borderColor: '#10B981', // green
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Distraction Time',
              data: distractionHours,
              borderColor: '#EF4444', // red
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.3,
              fill: true,
            }
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, dateRange, filters, supabase]);
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.dataset.label}: ${value.toFixed(1)} hours`;
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
  
  return <Line data={chartData} options={options} />;
};

export default ProductivityChart;

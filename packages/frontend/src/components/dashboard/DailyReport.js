import { useTimeTracking } from '../../hooks/useTimeTracking';
import Card from '../common/Card';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DailyReport() {
  const { timeEntries, getSummary } = useTimeTracking();
  const summary = getSummary();
  
  // Format seconds to hours:minutes
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  // If no data
  if (!timeEntries.length) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          Daily Report
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
          No time entries recorded today.
          <br />
          Start tracking your time to see insights!
        </div>
      </Card>
    );
  }
  
  // Prepare data for pie chart
  const pieData = {
    labels: Object.keys(summary.categories),
    datasets: [
      {
        data: Object.values(summary.categories),
        backgroundColor: [
          '#3B82F6', // blue
          '#10B981', // green
          '#F59E0B', // yellow
          '#EF4444', // red
          '#8B5CF6', // purple
          '#EC4899', // pink
          '#6B7280', // gray
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Calculate productivity percentage
  const productivityPercentage = summary.totalTracked
    ? Math.round((summary.productive / summary.totalTracked) * 100)
    : 0;
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
        <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </span>
        Daily Report
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="h-64 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <Pie
              data={pieData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.raw;
                        const percentage = Math.round(
                          (value / summary.totalTracked) * 100
                        );
                        return `${context.label}: ${formatDuration(value)} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Tracked</div>
            <div className="text-2xl font-medium text-gray-900 dark:text-white">{formatDuration(summary.totalTracked)}</div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Productive Time</div>
            <div className="text-2xl font-medium text-gray-900 dark:text-white">{formatDuration(summary.productive)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{productivityPercentage}% of total time</div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Distraction Time</div>
            <div className="text-2xl font-medium text-gray-900 dark:text-white">{formatDuration(summary.distracted)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{100 - productivityPercentage}% of total time</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
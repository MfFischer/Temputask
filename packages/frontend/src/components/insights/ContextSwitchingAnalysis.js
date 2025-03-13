import React, { useMemo } from 'react';
import Card from '../common/Card';
import { SwitchHorizontalIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Analyze context switching patterns
const analyzeContextSwitching = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) return { 
    switches: 0, 
    switchRate: 0,
    costEstimate: 0,
    dailySwitches: []
  };
  
  // Sort entries by start time
  const sortedEntries = [...timeEntries].sort((a, b) => 
    new Date(a.start_time) - new Date(b.start_time)
  );
  
  // Group entries by day for daily analysis
  const entriesByDay = {};
  
  // Track switches and tasks
  let switches = 0;
  let previousProject = null;
  let previousCategory = null;
  
  sortedEntries.forEach(entry => {
    if (!entry.start_time) return;
    
    const date = new Date(entry.start_time);
    const day = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    // Initialize day entry if it doesn't exist
    if (!entriesByDay[day]) {
      entriesByDay[day] = {
        day,
        date: new Date(day),
        entries: [],
        switches: 0,
        uniqueTasks: new Set(),
        totalTime: 0
      };
    }
    
    // Add entry to day
    entriesByDay[day].entries.push(entry);
    
    // Add unique task
    if (entry.project || entry.task) {
      entriesByDay[day].uniqueTasks.add(entry.project || entry.task);
    }
    
    // Calculate time if possible
    if (entry.start_time && entry.end_time) {
      const duration = new Date(entry.end_time) - new Date(entry.start_time);
      entriesByDay[day].totalTime += duration;
    }
    
    // Check for context switch
    const currentProject = entry.project || null;
    const currentCategory = entry.category || null;
    
    if (previousProject !== null && previousProject !== currentProject) {
      switches++;
      
      // Also increment day's switch count
      entriesByDay[day].switches++;
    } else if (previousCategory !== null && previousCategory !== currentCategory && 
               currentCategory !== 'Distraction') { // Don't count distraction as context switch
      switches++;
      
      // Also increment day's switch count
      entriesByDay[day].switches++;
    }
    
    previousProject = currentProject;
    previousCategory = currentCategory;
  });
  
  // Calculate total tracked time to get switch rate
  let totalTime = 0;
  sortedEntries.forEach(entry => {
    if (entry.start_time && entry.end_time) {
      const duration = new Date(entry.end_time) - new Date(entry.start_time);
      totalTime += duration;
    }
  });
  
  // Hours of total time
  const totalHours = totalTime / (1000 * 60 * 60);
  
  // Calculate switch rate (switches per hour)
  const switchRate = totalHours > 0 ? switches / totalHours : 0;
  
  // Productivity loss estimate (each switch costs ~23 minutes of productivity on average
  // according to research, but we'll be conservative and estimate 10-15 min)
  const switchCost = 12.5 * 60 * 1000; // 12.5 minutes in ms
  const costEstimate = switches * switchCost;
  
  // Convert days data to array and sort
  const dailySwitches = Object.values(entriesByDay).map(day => ({
    date: day.day,
    switches: day.switches,
    uniqueTasks: day.uniqueTasks.size,
    // Calculate switch rate for the day
    switchRate: day.totalTime > 0 ? (day.switches / (day.totalTime / (1000 * 60 * 60))).toFixed(1) : 0,
    // Format date for display
    displayDate: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return {
    switches,
    switchRate,
    costEstimate,
    dailySwitches
  };
};

// Helper to format milliseconds as hours and minutes
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

export default function ContextSwitchingAnalysis({ timeEntries }) {
  const switchingData = useMemo(() => analyzeContextSwitching(timeEntries), [timeEntries]);
  
  // Generate a severity score (0-100) based on context switching
  const severityScore = useMemo(() => {
    // Calculate based on switch rate
    // < 1 switch per hour is good (low score)
    // > 4 switches per hour is bad (high score)
    const rateScore = Math.min(Math.round(switchingData.switchRate * 25), 100);
    
    return rateScore;
  }, [switchingData]);
  
  // Get daily data for chart
  const chartData = useMemo(() => {
    return switchingData.dailySwitches.slice(-10); // Last 10 days
  }, [switchingData]);
  
  return (
    <Card className="overflow-hidden" animate={true}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-purple-500" />
          Context Switching Analysis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary metrics */}
          <div>
            <div className="flex items-center mb-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className={`
                  absolute inset-0 rounded-full 
                  ${severityScore <= 30 ? 'bg-green-100 dark:bg-green-900/30' : 
                    severityScore <= 70 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                    'bg-red-100 dark:bg-red-900/30'}
                `}></div>
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  ${severityScore <= 30 ? 'bg-green-200 dark:bg-green-800/40 text-green-800 dark:text-green-300' : 
                    severityScore <= 70 ? 'bg-yellow-200 dark:bg-yellow-800/40 text-yellow-800 dark:text-yellow-300' : 
                    'bg-red-200 dark:bg-red-800/40 text-red-800 dark:text-red-300'}
                  font-bold text-3xl
                `}>
                  {severityScore}
                </div>
              </div>
              
              <div className="ml-4">
                <h3 className="text-lg font-medium">Switch Severity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {severityScore <= 30 
                    ? "Minimal context switching" 
                    : severityScore <= 70 
                    ? "Moderate task switching" 
                    : "High context switching"}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Switches</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {switchingData.switches}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Switches/Hour</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {switchingData.switchRate.toFixed(1)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center">
                  <ExclamationCircleIcon className="h-3 w-3 mr-1 text-amber-500" />
                  Productivity Lost
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDuration(switchingData.costEstimate)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center">
                  <ArrowPathIcon className="h-3 w-3 mr-1 text-cyan-500" />
                  Avg Tasks/Day
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {switchingData.dailySwitches.length > 0 
                    ? (switchingData.dailySwitches.reduce((sum, day) => sum + day.uniqueTasks, 0) / 
                       switchingData.dailySwitches.length).toFixed(1) 
                    : '0'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Daily switching chart */}
          <div className="mt-4 md:mt-0">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Daily Context Switching</h3>
            {chartData.length > 0 ? (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="displayDate" 
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      label={{ 
                        value: 'Context Switches', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 10, textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === 'switches') {
                          return [`${value} switches (${props.payload.switchRate}/hr)`, 'Context Switches'];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="switches" name="switches">
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.switches <= 3 ? '#4ade80' : 
                                entry.switches <= 8 ? '#facc15' : 
                                '#f87171'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-60 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Not enough data for switching analysis</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recommendations section */}
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/50">
          <h3 className="text-sm font-medium flex items-center text-purple-700 dark:text-purple-300 mb-2">
            <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
            Switching Insights
          </h3>
          
          {switchingData.switches > 0 ? (
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {severityScore <= 30 
                ? `You're doing well at maintaining focus on individual tasks. Your average of ${switchingData.switchRate.toFixed(1)} context switches per hour is below the problematic threshold.` 
                : severityScore <= 70 
                ? `You're experiencing a moderate level of context switching (${switchingData.switchRate.toFixed(1)} per hour). Try time-blocking techniques to reduce task switching and recover approximately ${formatDuration(switchingData.costEstimate)} of lost productivity.` 
                : `Your high context switching rate of ${switchingData.switchRate.toFixed(1)} switches per hour may be costing you approximately ${formatDuration(switchingData.costEstimate)} in lost productivity. Consider implementing dedicated deep work periods with no interruptions.`}
            </p>
          ) : (
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Track more work sessions to receive context switching insights.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
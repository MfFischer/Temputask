import React, { useMemo } from 'react';
import Card from '../common/Card';
import { ChartBarIcon, BoltIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Helper function to identify flow states
const analyzeFlowStates = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) return { flowPeriods: [], totalFlowTime: 0, longestFlow: 0 };
  
  // Sort entries by start time
  const sortedEntries = [...timeEntries].sort((a, b) => 
    new Date(a.start_time) - new Date(b.start_time)
  );
  
  const flowPeriods = [];
  let currentFlow = null;
  
  // A flow state is defined as uninterrupted work for at least 25 minutes
  const FLOW_THRESHOLD_MS = 25 * 60 * 1000; // 25 minutes
  const MAX_INTERRUPTION_MS = 2 * 60 * 1000; // Allow 2 minute interruptions
  
  sortedEntries.forEach(entry => {
    // Skip entries without proper timestamps
    if (!entry.start_time || !entry.end_time) return;
    
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const duration = end - start;
    
    // Skip very short entries
    if (duration < 5 * 60 * 1000) return;
    
    // Check if this is distraction
    const isDistraction = entry.category === 'Distraction';
    
    if (!currentFlow && !isDistraction) {
      // Start a new potential flow period
      currentFlow = {
        start: start,
        end: end,
        duration: duration,
        entries: [entry]
      };
    } else if (currentFlow && !isDistraction) {
      // Check if this entry continues the flow
      const timeSinceLastEntry = start - currentFlow.end;
      
      if (timeSinceLastEntry <= MAX_INTERRUPTION_MS) {
        // Continue the flow
        currentFlow.end = end;
        currentFlow.duration += duration;
        currentFlow.entries.push(entry);
      } else {
        // Too much time passed, check if the previous flow was significant
        if (currentFlow.duration >= FLOW_THRESHOLD_MS) {
          flowPeriods.push(currentFlow);
        }
        
        // Start a new flow
        currentFlow = {
          start: start,
          end: end,
          duration: duration,
          entries: [entry]
        };
      }
    } else if (currentFlow && isDistraction) {
      // Distraction occurred, check if the flow was long enough to count
      if (currentFlow.duration >= FLOW_THRESHOLD_MS) {
        flowPeriods.push(currentFlow);
      }
      
      // Reset current flow
      currentFlow = null;
    }
  });
  
  // Check if the last flow state should be included
  if (currentFlow && currentFlow.duration >= FLOW_THRESHOLD_MS) {
    flowPeriods.push(currentFlow);
  }
  
  // Calculate stats
  const totalFlowTime = flowPeriods.reduce((sum, period) => sum + period.duration, 0);
  const longestFlow = flowPeriods.length > 0 
    ? Math.max(...flowPeriods.map(period => period.duration))
    : 0;
  
  return {
    flowPeriods,
    totalFlowTime,
    longestFlow,
    averageFlowDuration: flowPeriods.length > 0 ? totalFlowTime / flowPeriods.length : 0
  };
};

// Helper to format duration from milliseconds to human-readable
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

// Create chart data from flow states
const createFlowChartData = (flowData, timeEntries) => {
  if (!flowData.flowPeriods || flowData.flowPeriods.length === 0) return [];
  
  // Create an array with all work entries
  const allEntries = timeEntries.filter(entry => 
    entry.start_time && entry.end_time && entry.category !== 'Distraction'
  );
  
  // Group entries by hour of day to see when flow states occur
  const hourlyData = Array(24).fill().map((_, i) => ({
    hour: i,
    totalTime: 0,
    flowTime: 0,
    flowPercentage: 0
  }));
  
  // Calculate total work time by hour
  allEntries.forEach(entry => {
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const duration = end - start;
    
    // Add to the hour bucket
    const hour = start.getHours();
    hourlyData[hour].totalTime += duration;
  });
  
  // Calculate flow time by hour
  flowData.flowPeriods.forEach(period => {
    const start = new Date(period.start);
    const end = new Date(period.end);
    
    // Simple approach: add to the starting hour's bucket
    const hour = start.getHours();
    hourlyData[hour].flowTime += period.duration;
  });
  
  // Calculate percentages and format for chart
  return hourlyData.map(data => {
    const percentage = data.totalTime > 0 
      ? (data.flowTime / data.totalTime) * 100 
      : 0;
    
    return {
      hour: `${data.hour}:00`,
      totalMinutes: Math.round(data.totalTime / (1000 * 60)),
      flowMinutes: Math.round(data.flowTime / (1000 * 60)),
      flowPercentage: Math.round(percentage)
    };
  });
};

export default function FlowStateAnalysis({ timeEntries }) {
  const flowData = useMemo(() => analyzeFlowStates(timeEntries), [timeEntries]);
  const chartData = useMemo(() => createFlowChartData(flowData, timeEntries), [flowData, timeEntries]);
  
  // Calculate flow stats
  const totalWorkTime = useMemo(() => {
    if (!timeEntries || timeEntries.length === 0) return 0;
    
    return timeEntries.reduce((total, entry) => {
      if (!entry.start_time || !entry.end_time || entry.category === 'Distraction') return total;
      const duration = new Date(entry.end_time) - new Date(entry.start_time);
      return total + duration;
    }, 0);
  }, [timeEntries]);
  
  const flowPercentage = totalWorkTime > 0 
    ? Math.round((flowData.totalFlowTime / totalWorkTime) * 100)
    : 0;
  
  const flowScore = Math.min(
    Math.round((flowPercentage * 0.5) + (flowData.flowPeriods.length * 5) + 
    (flowData.averageFlowDuration / (1000 * 60 * 30) * 15)), 
    100
  );
  
  return (
    <Card className="overflow-hidden" animate={true}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BoltIcon className="h-5 w-5 mr-2 text-yellow-500" />
          Flow State Analysis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Flow score and metrics */}
          <div>
            <div className="flex items-center mb-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className={`
                  absolute inset-0 rounded-full 
                  ${flowScore >= 70 ? 'bg-green-100 dark:bg-green-900/30' : 
                    flowScore >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                    'bg-red-100 dark:bg-red-900/30'}
                `}></div>
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  ${flowScore >= 70 ? 'bg-green-200 dark:bg-green-800/40 text-green-800 dark:text-green-300' : 
                    flowScore >= 40 ? 'bg-yellow-200 dark:bg-yellow-800/40 text-yellow-800 dark:text-yellow-300' : 
                    'bg-red-200 dark:bg-red-800/40 text-red-800 dark:text-red-300'}
                  font-bold text-3xl
                `}>
                  {flowScore}
                </div>
              </div>
              
              <div className="ml-4">
                <h3 className="text-lg font-medium">Flow Score</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {flowScore >= 70 ? "Excellent flow state ability" : 
                   flowScore >= 40 ? "Good flow capacity" : 
                   "Opportunity to improve flow"}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Flow Sessions</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {flowData.flowPeriods.length}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Flow Time</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDuration(flowData.totalFlowTime)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Longest Session</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDuration(flowData.longestFlow)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Flow Ratio</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {flowPercentage}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Flow chart */}
          <div className="mt-4 md:mt-0">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flow States by Hour</h3>
            {chartData.length > 0 ? (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(hour) => hour.split(':')[0]}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 10 }}
                      label={{ 
                        value: 'Minutes', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 10, textAnchor: 'middle' }
                      }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fontSize: 10 }}
                      label={{ 
                        value: 'Flow %', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { fontSize: 10, textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'flowPercentage') return [`${value}%`, 'Flow %'];
                        return [value, name === 'totalMinutes' ? 'Work Minutes' : 'Flow Minutes'];
                      }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="totalMinutes" 
                      stroke="#94a3b8" 
                      strokeWidth={2}
                      dot={false}
                      name="totalMinutes"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="flowMinutes" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ fill: '#3b82f6' }}
                      name="flowMinutes"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="flowPercentage" 
                      stroke="#f59e0b" 
                      strokeWidth={2} 
                      dot={false}
                      name="flowPercentage"
                    />
                    <ReferenceLine yAxisId="right" y={50} stroke="#f59e0b" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-60 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Not enough data for flow analysis</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Insights section */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <h3 className="text-sm font-medium flex items-center text-blue-700 dark:text-blue-300 mb-2">
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            Flow Insights
          </h3>
          
          {flowData.flowPeriods.length > 0 ? (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {flowScore >= 70 
                ? `You excel at achieving flow states, averaging ${formatDuration(flowData.averageFlowDuration)} of uninterrupted deep work. Your most productive flow periods happen around ${chartData.reduce((best, data) => data.flowPercentage > best.flowPercentage ? data : best, {flowPercentage: 0}).hour}.`
                : flowScore >= 40 
                ? `You have good periods of flow, but could benefit from longer sessions. Try scheduling your deep work during ${chartData.reduce((best, data) => data.flowPercentage > best.flowPercentage ? data : best, {flowPercentage: 0}).hour} when you show the highest flow percentage.`
                : `You're experiencing limited flow states. Consider reducing distractions and using the Focus Timer to help build your concentration stamina.`}
            </p>
          ) : (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Track more focus sessions to receive flow state insights.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
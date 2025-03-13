import React, { useMemo, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
  ClockIcon, 
  ExclamationTriangleIcon, 
  ArrowUpCircleIcon, 
  ArrowDownCircleIcon,
  BeakerIcon,
  FireIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

const DistractionPatterns = ({ timeEntries }) => {
  const [viewMode, setViewMode] = useState('hourly'); // 'hourly', 'daily', 'sources'
  const [showDetails, setShowDetails] = useState(false);
  
  // Extract distraction-related data from time entries
  const distractionData = useMemo(() => {
    // Get distraction entries
    const distractionEntries = timeEntries.filter(entry => 
      entry.category === 'Distraction' && entry.duration
    );
    
    // Get distribution by hour of day
    const hours = Array(24).fill(0);
    const hourCounts = Array(24).fill(0);
    
    // Get distribution by day of week
    const daysOfWeek = Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get distribution by source (if available)
    const sourceMap = {};
    
    // Trend over time (group by day)
    const dateMap = {};
    
    distractionEntries.forEach(entry => {
      if (!entry.start_time) return;
      
      const startDate = new Date(entry.start_time);
      const hour = startDate.getHours();
      const dayOfWeek = startDate.getDay();
      const dateKey = startDate.toISOString().split('T')[0];
      
      // Update hourly stats
      hours[hour] += entry.duration || 0;
      hourCounts[hour]++;
      
      // Update daily stats
      daysOfWeek[dayOfWeek] += entry.duration || 0;
      
      // Update source stats
      const source = entry.source || entry.app || entry.website || 'Unknown';
      if (!sourceMap[source]) {
        sourceMap[source] = {
          source,
          totalTime: 0,
          count: 0
        };
      }
      sourceMap[source].totalTime += entry.duration || 0;
      sourceMap[source].count++;
      
      // Update date trend
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          formattedDate: new Date(dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          totalTime: 0,
          count: 0
        };
      }
      dateMap[dateKey].totalTime += entry.duration || 0;
      dateMap[dateKey].count++;
    });
    
    // Find peak distraction hours (top 3)
    const peakHours = hours
      .map((duration, hour) => ({ hour, duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 3)
      .filter(item => item.duration > 0);
      
    // Find peak days
    const peakDays = daysOfWeek
      .map((duration, day) => ({ day, dayName: dayNames[day], dayShortName: dayShortNames[day], duration }))
      .sort((a, b) => b.duration - a.duration);
    
    // Sort sources by time spent
    const sources = Object.values(sourceMap)
      .map(source => ({
        ...source,
        // Calculate average time per occurrence
        avgTime: source.count > 0 ? source.totalTime / source.count : 0
      }))
      .sort((a, b) => b.totalTime - a.totalTime);
    
    // Build trend data
    const trend = Object.values(dateMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
    
    // Calculate overall stats
    const totalTime = distractionEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
    const totalCount = distractionEntries.length;
    const avgTimePerDistraction = totalCount > 0 ? totalTime / totalCount : 0;
    
    // Calculate intensity score (0-100)
    // Based on average distraction duration and frequency
    const maxIntensity = 900; // 15 minutes is considered high intensity
    const intensityScore = Math.min(
      Math.round((avgTimePerDistraction / maxIntensity) * 100), 
      100
    );
    
    // Peak distraction time of day (morning, afternoon, evening)
    const morningHours = hours.slice(5, 12).reduce((sum, time) => sum + time, 0);
    const afternoonHours = hours.slice(12, 17).reduce((sum, time) => sum + time, 0);
    const eveningHours = hours.slice(17, 22).reduce((sum, time) => sum + time, 0);
    const nightHours = [...hours.slice(22, 24), ...hours.slice(0, 5)].reduce((sum, time) => sum + time, 0);
    
    const peakTimeOfDay = [
      { name: 'Morning', value: morningHours },
      { name: 'Afternoon', value: afternoonHours },
      { name: 'Evening', value: eveningHours },
      { name: 'Night', value: nightHours }
    ].sort((a, b) => b.value - a.value)[0];
    
    return {
      hours,
      hourCounts,
      peakHours,
      daysOfWeek: peakDays,
      sources,
      trend,
      totalTime,
      totalCount,
      avgTimePerDistraction,
      intensityScore,
      peakTimeOfDay
    };
  }, [timeEntries]);
  
  // Format hours for display
  const formatHour = (hour) => {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${suffix}`;
  };
  
  // Format time in minutes
  const formatMinutes = (seconds) => {
    return Math.round(seconds / 60);
  };

  // Format time in hours and minutes
  const formatHoursMinutes = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  // Get intensity color
  const getIntensityColor = (score) => {
    if (score <= 30) return 'text-green-600 dark:text-green-400';
    if (score <= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  // Get intensity background color
  const getIntensityBgColor = (score) => {
    if (score <= 30) return 'bg-green-100 dark:bg-green-900/20';
    if (score <= 70) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };
  
  // Chart data for hourly view
  const hourlyChartData = useMemo(() => {
    return distractionData.hours.map((duration, hour) => ({
      hour: formatHour(hour),
      hourNum: hour,
      value: Math.round(duration / 60), // Convert to minutes
      count: distractionData.hourCounts[hour]
    }));
  }, [distractionData.hours, distractionData.hourCounts]);
  
  // Chart data for daily view
  const dailyChartData = useMemo(() => {
    return distractionData.daysOfWeek.map(day => ({
      day: day.dayName,
      dayShort: day.dayShortName,
      value: Math.round(day.duration / 60) // Convert to minutes
    }));
  }, [distractionData.daysOfWeek]);
  
  // Chart data for sources
  const sourceChartData = useMemo(() => {
    return distractionData.sources.slice(0, 5).map(src => ({
      name: src.source,
      value: Math.round(src.totalTime / 60) // Convert to minutes
    }));
  }, [distractionData.sources]);
  
  // Chart data for trend
  const trendChartData = useMemo(() => {
    return distractionData.trend.map(day => ({
      date: day.formattedDate,
      value: Math.round(day.totalTime / 60), // Convert to minutes
      count: day.count
    }));
  }, [distractionData.trend]);
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // No distractions case
  if (distractionData.totalCount === 0) {
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-amber-500" />
            Distraction Patterns
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <ClockIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">No distractions logged yet</h3>
            <p className="text-blue-600 dark:text-blue-400">
              That's great! Keep up the focused work or start logging distractions to see patterns.
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden" animate>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-amber-500" />
            Distraction Patterns
          </h2>
          
          {/* View selector */}
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button 
              variant={viewMode === 'hourly' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('hourly')}
            >
              <ClockIcon className="h-4 w-4 mr-1" />
              By Hour
            </Button>
            <Button 
              variant={viewMode === 'daily' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('daily')}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              By Day
            </Button>
            <Button 
              variant={viewMode === 'sources' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('sources')}
            >
              <BeakerIcon className="h-4 w-4 mr-1" />
              Sources
            </Button>
          </div>
        </div>
        
        {/* Distraction summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2 mr-3">
                <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Distraction Time</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatHoursMinutes(distractionData.totalTime)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 mr-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Distraction Events</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {distractionData.totalCount}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2 mr-3">
                <FireIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Duration</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatMinutes(distractionData.avgTimePerDistraction)}m
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className={`rounded-full p-2 mr-3 ${getIntensityBgColor(distractionData.intensityScore)}`}>
                <ChartBarIcon className={`h-5 w-5 ${getIntensityColor(distractionData.intensityScore)}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Intensity Score</p>
                <p className={`text-lg font-semibold ${getIntensityColor(distractionData.intensityScore)}`}>
                  {distractionData.intensityScore}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main analysis section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column for charts */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                {viewMode === 'hourly' ? 'Distraction Time by Hour of Day' : 
                 viewMode === 'daily' ? 'Distraction Time by Day of Week' : 
                 'Top Distraction Sources'}
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'hourly' ? (
                    <BarChart data={hourlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 10 }}
                        interval={3}
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        label={{ 
                          value: 'Minutes', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fontSize: 10, textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} minutes`, 'Distraction Time']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#f59e0b" 
                        name="Distraction Minutes"
                        radius={[4, 4, 0, 0]}
                      >
                        {hourlyChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.value > 30 ? '#ef4444' : 
                                  entry.value > 15 ? '#f59e0b' : 
                                  '#3b82f6'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : viewMode === 'daily' ? (
                    <BarChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="dayShort" 
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        label={{ 
                          value: 'Minutes', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fontSize: 10, textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} minutes`, 'Distraction Time']}
                        labelFormatter={(label) => `Day: ${dailyChartData.find(d => d.dayShort === label)?.day}`}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#8884d8" 
                        name="Distraction Minutes"
                        radius={[4, 4, 0, 0]}
                      >
                        {dailyChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.value > 60 ? '#ef4444' : 
                                  entry.value > 30 ? '#f59e0b' : 
                                  '#3b82f6'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {sourceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} minutes`, 'Distraction Time']} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Trend over time */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Distraction Trend (Last 14 Days)
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      label={{ 
                        value: 'Minutes', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 10, textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'value') return [`${value} minutes`, 'Distraction Time'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }}
                      name="value"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Right column for insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Peak distraction insight */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Peak Distraction Periods
              </h3>
              
              {distractionData.peakHours.length > 0 ? (
                <div className="space-y-4">
                  {distractionData.peakHours.slice(0, 2).map((peak, index) => (
                    <div 
                      key={peak.hour} 
                      className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30"
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center mr-4
                        ${index === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                          'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'}
                      `}>
                        <ClockIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {formatHour(peak.hour)}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatMinutes(peak.duration)} minutes of distractions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-green-700 dark:text-green-300 italic">
                    No significant distraction patterns detected.
                  </p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time of Day Analysis
                </h4>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
                  <p className="text-sm">
                    <span className="font-medium">Peak distraction period:</span> {distractionData.peakTimeOfDay?.name}
                  </p>
                  <p className="text-sm mt-1">
                    {distractionData.peakTimeOfDay?.name === 'Morning' ?
                      "You tend to get distracted more in the morning. Consider starting your day with a focused ritual before checking emails or messages." :
                     distractionData.peakTimeOfDay?.name === 'Afternoon' ?
                      "Afternoon energy dips lead to more distractions. Try scheduling a short break or quick walk to reset your focus." :
                     distractionData.peakTimeOfDay?.name === 'Evening' ?
                      "Evening hours show higher distraction rates. This may be due to fatigue - consider wrapping up complex tasks earlier in the day." :
                      "Late night work sessions show higher distraction rates. This may indicate fatigue-related focus issues."}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Behavioral insights */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-4">
                <BeakerIcon className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Distraction Analysis
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                  <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                    Duration Profile
                  </h4>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    {distractionData.avgTimePerDistraction < 300 ?
                      "You experience frequent but brief distractions (averaging less than 5 minutes). This suggests notification or chat interruptions. Consider using 'Do Not Disturb' mode during focus periods." :
                     distractionData.avgTimePerDistraction < 900 ?
                      "Your distractions last a moderate amount of time (5-15 minutes on average). This may indicate task-switching or brief social media usage. Try using a website blocker for problematic sites." :
                      "Your distractions are extended periods (over 15 minutes on average). This indicates deep context switching away from work tasks. Try to identify what triggers these switches and set clearer work boundaries."}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                    Pattern Insight
                  </h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    {dailyChartData.findIndex(day => day.dayShort === 'Mon') === 0 &&
                     dailyChartData[0].value > dailyChartData[1].value ?
                      "Monday shows higher distraction rates, suggesting weekend-to-workweek transition challenges. Try planning Monday with more structure." :
                     trendChartData.length > 5 && 
                     trendChartData[trendChartData.length-1].value < trendChartData[trendChartData.length-5].value ?
                      "Your distraction time is trending downward - great job! Continue using techniques that are working for you." :
                     hourlyChartData.slice(12, 14).some(hour => hour.value > 20) ?
                      "Post-lunch hours (1-2PM) show elevated distraction levels. This aligns with natural circadian rhythm dips - consider scheduling less demanding tasks during this period." :
                      "Your distraction patterns appear random. This suggests external interruptions rather than internal focus issues. Consider setting stronger boundaries around your work environment."}
                  </p>
                </div>
              </div>
              
              <button 
                className="mt-4 w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 
                          hover:text-indigo-800 dark:hover:text-indigo-300 font-medium
                          border border-indigo-200 dark:border-indigo-800/50 rounded-lg
                          hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <span className="flex items-center justify-center">
                    <ArrowUpCircleIcon className="h-4 w-4 mr-1" />
                    Show Less Details
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <ArrowDownCircleIcon className="h-4 w-4 mr-1" />
                    Show More Details
                  </span>
                )}
              </button>
              
              {/* Detailed distraction sources */}
              {showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Detailed Distraction Sources
                  </h4>
                  
                  <div className="overflow-hidden bg-gray-50 dark:bg-slate-800/80 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-slate-700">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Source
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Time
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Count
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {distractionData.sources.slice(0, 6).map((source, index) => (
                          <tr key={source.source} className={index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700/30'}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 font-medium">
                              {source.source}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {formatHoursMinutes(source.totalTime)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {source.count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DistractionPatterns;
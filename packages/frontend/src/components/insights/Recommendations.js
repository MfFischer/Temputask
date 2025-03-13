import React, { useState, useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
  LightBulbIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  StarIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  CheckIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

const Recommendations = ({ timeEntries }) => {
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'focus', 'productivity', 'balance'
  
  // Analyze time entries for useful recommendations
  const analysisData = useMemo(() => {
    // Check for short sessions
    const shortSessions = timeEntries.filter(entry => 
      entry.category !== 'Distraction' && 
      entry.duration && 
      entry.duration < 900 // Less than 15 minutes
    ).length;
    
    const totalSessions = timeEntries.filter(entry => 
      entry.category !== 'Distraction' && entry.duration
    ).length;
    
    // Get distraction percentage
    const distractedTime = timeEntries
      .filter(entry => entry.category === 'Distraction')
      .reduce((total, entry) => total + (entry.duration || 0), 0);
      
    const totalTime = timeEntries
      .reduce((total, entry) => total + (entry.duration || 0), 0);
      
    const distractionPercentage = totalTime > 0 
      ? (distractedTime / totalTime) * 100 
      : 0;
    
    // Check for long focus sessions
    const longFocusSessions = timeEntries.filter(entry => 
      entry.category !== 'Distraction' && 
      entry.duration && 
      entry.duration > 5400 // More than 90 minutes
    ).length;
    
    // Check work distribution by hour
    const hourDistribution = Array(24).fill(0);
    timeEntries.forEach(entry => {
      if (!entry.duration) return;
      const hour = new Date(entry.start_time).getHours();
      hourDistribution[hour] += entry.duration;
    });
    
    const totalDurationHours = hourDistribution.reduce((sum, val) => sum + val, 0) / 3600;
    
    // Check early morning work (5am-10am)
    const earlyHours = hourDistribution.slice(5, 10).reduce((sum, val) => sum + val, 0) / 3600;
    
    // Check late night work (10pm-5am)
    const lateHours = hourDistribution.slice(22, 24).concat(hourDistribution.slice(0, 5)).reduce((sum, val) => sum + val, 0) / 3600;
    
    // Check afternoon work (1pm-4pm)
    const afternoonHours = hourDistribution.slice(13, 16).reduce((sum, val) => sum + val, 0) / 3600;
    
    // Find peak productivity hours
    const productiveHours = hourDistribution
      .map((duration, hour) => ({ hour, duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 3)
      .filter(item => item.duration > 0);
      
    // Calculate consistency (how many days have time entries)
    const days = timeEntries.reduce((acc, entry) => {
      if (!entry.start_time) return acc;
      const date = new Date(entry.start_time).toISOString().split('T')[0];
      return acc.includes(date) ? acc : [...acc, date];
    }, []);
    
    const consistencyPercentage = days.length > 0 
      ? (days.length / 30) * 100 // Assuming last 30 days
      : 0;
      
    // Calculate average work session length
    const workSessions = timeEntries.filter(entry => 
      entry.category !== 'Distraction' && entry.duration
    );
    
    const avgSessionLength = workSessions.length > 0
      ? workSessions.reduce((sum, entry) => sum + entry.duration, 0) / workSessions.length
      : 0;
      
    // Calculate task switching frequency
    let taskSwitches = 0;
    let previousTask = null;
    
    timeEntries
      .filter(entry => entry.category !== 'Distraction')
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .forEach(entry => {
        const currentTask = entry.project || entry.task;
        if (previousTask !== null && previousTask !== currentTask) {
          taskSwitches++;
        }
        previousTask = currentTask;
      });
      
    const taskSwitchesPerHour = totalDurationHours > 0
      ? taskSwitches / totalDurationHours
      : 0;
    
    return {
      shortSessionsPercentage: totalSessions > 0 ? (shortSessions / totalSessions) * 100 : 0,
      distractionPercentage,
      longFocusSessions,
      earlyMorningPercentage: totalDurationHours > 0 ? (earlyHours / totalDurationHours) * 100 : 0,
      lateNightPercentage: totalDurationHours > 0 ? (lateHours / totalDurationHours) * 100 : 0,
      afternoonPercentage: totalDurationHours > 0 ? (afternoonHours / totalDurationHours) * 100 : 0,
      productiveHours,
      consistencyPercentage,
      taskSwitchesPerHour,
      avgSessionLength,
      totalSessions,
      totalTrackedTime: totalTime,
      daysTracked: days.length
    };
  }, [timeEntries]);
  
  // Generate recommendations based on analysis
  const recommendations = useMemo(() => {
    const allRecommendations = [];
    
    // FOCUS RECOMMENDATIONS
    if (analysisData.shortSessionsPercentage > 50) {
      allRecommendations.push({
        id: 'limit-switching',
        title: 'Limit Context Switching',
        description: 'You have many short work sessions. This suggests frequent context switching, which can reduce overall productivity by up to 40%.',
        action: 'Try using the Pomodoro technique (25-minute focused sessions) to maintain concentration.',
        icon: ClockIcon,
        type: 'warning',
        category: 'focus',
        data: `${Math.round(analysisData.shortSessionsPercentage)}% of your sessions are under 15 minutes`,
        priority: analysisData.shortSessionsPercentage > 70 ? 'high' : 'medium',
        experimentation: 'For 1 week, try working in 25-minute blocks without checking email or messages. Compare your output to your normal work pattern.'
      });
    }
    
    if (analysisData.distractionPercentage > 20) {
      allRecommendations.push({
        id: 'reduce-distractions',
        title: 'Reduce Distractions',
        description: 'Your distraction time is higher than optimal. Research shows that it takes an average of 23 minutes to fully regain focus after a distraction.',
        action: 'Try using Focus Mode and blocking distracting websites during your peak productivity hours.',
        icon: ExclamationCircleIcon,
        type: 'danger',
        category: 'focus',
        data: `${Math.round(analysisData.distractionPercentage)}% of your tracked time is spent on distractions`,
        priority: analysisData.distractionPercentage > 30 ? 'high' : 'medium',
        experimentation: 'Identify your top 3 distraction sources and block them completely for 3 days. Measure your productivity impact.'
      });
    }
    
    if (analysisData.longFocusSessions === 0) {
      allRecommendations.push({
        id: 'deep-work',
        title: 'Build Sustained Focus',
        description: 'You haven\'t recorded any long focus sessions (90+ minutes). Deep, uninterrupted focus is key to tackling complex problems and creative work.',
        action: 'Schedule at least one 90-minute deep work session per day for your most important tasks.',
        icon: BoltIcon,
        type: 'info',
        category: 'focus',
        data: '0 deep work sessions recorded',
        priority: 'medium',
        experimentation: 'Set aside 90 minutes tomorrow morning with no distractions. Work on your most complex task and note how much progress you make.'
      });
    }
    
    // PRODUCTIVITY RECOMMENDATIONS
    if (analysisData.taskSwitchesPerHour > 3) {
      allRecommendations.push({
        id: 'task-batching',
        title: 'Implement Task Batching',
        description: 'You switch between different tasks frequently. Each switch incurs a mental "switching cost" that reduces overall efficiency.',
        action: 'Group similar tasks together and work on them in batches to minimize context switching.',
        icon: ArrowPathIcon,
        type: 'warning',
        category: 'productivity',
        data: `${analysisData.taskSwitchesPerHour.toFixed(1)} task switches per hour`,
        priority: analysisData.taskSwitchesPerHour > 5 ? 'high' : 'medium',
        experimentation: 'Tomorrow, batch all your emails into two 30-minute sessions (morning and afternoon) instead of checking throughout the day.'
      });
    }
    
    if (analysisData.productiveHours && analysisData.productiveHours.length > 0) {
      // Format hour for display
      const formatHour = (hour) => {
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour} ${suffix}`;
      };
      
      const topHours = analysisData.productiveHours
        .slice(0, 2)
        .map(h => formatHour(h.hour))
        .join(' and ');
        
      allRecommendations.push({
        id: 'peak-hours',
        title: 'Optimize Your Peak Hours',
        description: `Your data shows that you're most productive around ${topHours}. Aligning your most challenging work with your biological peak can increase effectiveness.`,
        action: `Schedule your highest-value work during ${topHours} when possible.`,
        icon: StarIcon,
        type: 'success',
        category: 'productivity',
        data: `Peak productivity detected at ${topHours}`,
        priority: 'medium',
        experimentation: `For the next week, schedule your most important task at ${analysisData.productiveHours[0].hour % 12 || 12}${analysisData.productiveHours[0].hour >= 12 ? 'pm' : 'am'} and track its completion quality.`
      });
    }
    
    if (analysisData.afternoonPercentage > 40) {
      allRecommendations.push({
        id: 'afternoon-slump',
        title: 'Combat the Afternoon Slump',
        description: 'You do a significant amount of work in the early afternoon, when many people experience a natural energy dip due to circadian rhythms.',
        action: 'Schedule a short break or light physical activity around 2pm to counter the post-lunch productivity dip.',
        icon: ArrowTrendingUpIcon,
        type: 'info',
        category: 'productivity',
        data: `${Math.round(analysisData.afternoonPercentage)}% of work done between 1-4pm`,
        priority: 'low',
        experimentation: 'Take a 10-minute walking break at 2pm each day for a week and note if you feel more energized afterward.'
      });
    }
    
    // WORK-LIFE BALANCE RECOMMENDATIONS
    if (analysisData.lateNightPercentage > 15) {
      allRecommendations.push({
        id: 'late-night',
        title: 'Evaluate Late Night Work',
        description: 'You work late at night frequently. While this works for some people, research shows that it can impact sleep quality and next-day performance for many.',
        action: 'If possible, try shifting some of your late night work to morning or daytime hours for one week and compare your energy levels.',
        icon: ClockIcon,
        type: 'warning',
        category: 'balance',
        data: `${Math.round(analysisData.lateNightPercentage)}% of work done between 10pm-5am`,
        priority: analysisData.lateNightPercentage > 25 ? 'high' : 'medium',
        experimentation: 'For one week, stop working at least 90 minutes before bedtime and note any changes in sleep quality and next-day focus.'
      });
    }
    
    if (analysisData.earlyMorningPercentage > 30) {
      allRecommendations.push({
        id: 'morning-routine',
        title: 'Optimize Your Morning Routine',
        description: "You're highly productive in the early morning hours. Research shows that habits during the first hour after waking can set the tone for the entire day.",
        action: 'Create a consistent morning ritual that includes your most important focused work before checking email or messages.',
        icon: CheckCircleIcon,
        type: 'success',
        category: 'balance',
        data: `${Math.round(analysisData.earlyMorningPercentage)}% of work done between 5-10am`,
        priority: 'medium',
        experimentation: 'Before checking any devices tomorrow morning, spend 30 minutes on your most important task. Note how this affects your entire day.'
      });
    }
    
    if (analysisData.consistencyPercentage < 60) {
      allRecommendations.push({
        id: 'consistency',
        title: 'Build Work Consistency',
        description: 'Your tracking shows variable work patterns. Consistent daily habits have been shown to reduce decision fatigue and improve overall productivity.',
        action: 'Try establishing a consistent daily work schedule, even if for shorter periods, rather than working sporadically.',
        icon: ChatBubbleLeftRightIcon,
        type: 'info',
        category: 'balance',
        data: `Working on ${analysisData.daysTracked} out of the last 30 days`,
        priority: analysisData.consistencyPercentage < 40 ? 'high' : 'medium',
        experimentation: 'Set a recurring daily work block of at least 2 hours at the same time each day for two weeks.'
      });
    }
    
    if (analysisData.totalTrackedTime < 3600 * 7 && analysisData.daysTracked > 0) {
      allRecommendations.push({
        id: 'more-tracking',
        title: 'Track More to Get Better Insights',
        description: 'Your current tracking data is limited. More comprehensive tracking will lead to more personalized and accurate recommendations.',
        action: 'Try to track all your work activities for at least a week, including distractions and breaks.',
        icon: BeakerIcon,
        type: 'info',
        category: 'productivity',
        data: `Only ${Math.round(analysisData.totalTrackedTime / 3600)} hours tracked total`,
        priority: 'low',
        experimentation: null
      });
    }
    
    // Add default recommendation if none were generated
    if (allRecommendations.length === 0) {
      allRecommendations.push({
        id: 'default',
        title: 'Track More to Get Personalized Insights',
        description: 'Keep tracking your time to receive more tailored productivity recommendations based on your specific work patterns.',
        action: 'Start tracking your time regularly, including both focused work and distractions.',
        icon: LightBulbIcon,
        type: 'info',
        category: 'productivity',
        data: null,
        priority: 'medium',
        experimentation: null
      });
    }
    
    return allRecommendations;
  }, [analysisData]);
  
  // Filter recommendations by category
  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === 'all') {
      return recommendations;
    }
    return recommendations.filter(rec => rec.category === selectedCategory);
  }, [recommendations, selectedCategory]);
  
  // Get color classes based on recommendation type
  const getTypeClasses = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/30';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30';
      case 'danger':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/30';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30';
    }
  };
  
  // Get icon background classes based on recommendation type
  const getIconBgClasses = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-400';
      case 'info':
      default:
        return 'bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400';
    }
  };
  
  // Get priority badge classes
  const getPriorityClasses = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };
  
  // Toggle saving a recommendation
  const toggleSaveRecommendation = (id) => {
    if (savedRecommendations.includes(id)) {
      setSavedRecommendations(savedRecommendations.filter(recId => recId !== id));
    } else {
      setSavedRecommendations([...savedRecommendations, id]);
    }
  };
  
  return (
    <Card className="overflow-hidden" animate>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2 text-amber-500" />
            Smart Recommendations
          </h2>
          
          {/* Category selector */}
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button 
              variant={selectedCategory === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            <Button 
              variant={selectedCategory === 'focus' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('focus')}
            >
              Focus
            </Button>
            <Button 
              variant={selectedCategory === 'productivity' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('productivity')}
            >
              Productivity
            </Button>
            <Button 
              variant={selectedCategory === 'balance' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('balance')}
            >
              Balance
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {filteredRecommendations.map((rec) => (
            <div 
              key={rec.id}
              className={`rounded-lg p-5 border ${getTypeClasses(rec.type)}`}
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-lg mr-4 ${getIconBgClasses(rec.type)}`}>
                  <rec.icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h3 className="font-medium text-lg">{rec.title}</h3>
                      {rec.priority && (
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClasses(rec.priority)}`}>
                          {rec.priority === 'high' ? 'High Priority' : 
                           rec.priority === 'medium' ? 'Medium Priority' : 
                           'Low Priority'}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      className="text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400 transition-colors"
                      onClick={() => toggleSaveRecommendation(rec.id)}
                      title={savedRecommendations.includes(rec.id) ? "Unsave recommendation" : "Save recommendation"}
                    >
                      <BookmarkIcon 
                        className={`h-5 w-5 ${savedRecommendations.includes(rec.id) ? 'text-amber-500 dark:text-amber-400 fill-current' : ''}`} 
                      />
                    </button>
                  </div>
                  
                  <p className="mt-2">{rec.description}</p>
                  
                  {rec.data && (
                    <div className="mt-3 text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-md inline-block">
                      {rec.data}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-opacity-30">
                    <div className="flex items-start">
                      <div className="p-1 bg-white dark:bg-gray-800 rounded-full mr-2 -ml-1">
                        <CheckIcon className="h-4 w-4 text-green-500 dark:text-green-400" />
                      </div>
                      <p className="text-sm font-medium">Try this: {rec.action}</p>
                    </div>
                    
                    {rec.experimentation && (
                      <div className="mt-3 flex items-start">
                        <div className="p-1 bg-white dark:bg-gray-800 rounded-full mr-2 -ml-1">
                          <BeakerIcon className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                        </div>
                        <p className="text-sm font-medium">Experiment: {rec.experimentation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredRecommendations.length === 0 && (
            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                <LightBulbIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No recommendations in this category</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track more of your work to receive personalized recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Recommendations;
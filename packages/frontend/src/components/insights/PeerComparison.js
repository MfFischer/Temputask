import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
  UsersIcon, 
  ArrowTrendingUpIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  ExclamationCircleIcon,
  QuestionMarkCircleIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const PeerComparison = ({ productivity, focusTime, distractions, taskSwitching, flowScore }) => {
  const [comparisonGroup, setComparisonGroup] = useState('industry'); // 'industry', 'role', 'top'
  const [chartType, setChartType] = useState('bar'); // 'bar', 'radar'
  
  // Mock comparison data - in a real app this would come from backend
  const getComparisonData = () => {
    // Base data
    const baseData = {
      industry: {
        name: 'Industry Average',
        productivity: 70,
        focusTime: 3.5,
        distractions: 18,
        taskSwitching: 3.8,
        flowScore: 62,
        description: 'Average across all tech industry professionals'
      },
      role: {
        name: 'Similar Role',
        productivity: 74,
        focusTime: 3.8,
        distractions: 15,
        taskSwitching: 3.2,
        flowScore: 68,
        description: 'Average for professionals in similar roles'
      },
      top: {
        name: 'Top Performers',
        productivity: 86,
        focusTime: 5.2,
        distractions: 8,
        taskSwitching: 1.9,
        flowScore: 88,
        description: 'Top 10% most productive users'
      }
    };
    
    // Ensure user data is defined with defaults
    const userData = {
      name: 'You',
      productivity: productivity || 75,
      focusTime: focusTime || 4,
      distractions: distractions || 12,
      taskSwitching: taskSwitching || 2.5,
      flowScore: flowScore || 65,
      description: 'Your current performance'
    };
    
    // Return appropriate data based on selected group
    return {
      userData,
      comparisonData: baseData[comparisonGroup]
    };
  };
  
  const { userData, comparisonData } = getComparisonData();
  
  // Format data for bar chart
  const getBarChartData = () => {
    return [
      {
        name: 'Productivity',
        you: userData.productivity,
        peer: comparisonData.productivity,
        unit: '',
        suffix: '%'
      },
      {
        name: 'Focus Time',
        you: userData.focusTime,
        peer: comparisonData.focusTime,
        unit: 'hours',
        suffix: 'h'
      },
      {
        name: 'Distractions',
        you: userData.distractions,
        peer: comparisonData.distractions,
        unit: 'percent',
        suffix: '%'
      },
      {
        name: 'Task Switching',
        you: userData.taskSwitching,
        peer: comparisonData.taskSwitching,
        unit: 'per hour',
        suffix: '/hr'
      },
      {
        name: 'Flow Score',
        you: userData.flowScore,
        peer: comparisonData.flowScore,
        unit: '',
        suffix: ''
      }
    ];
  };
  
  // Format data for radar chart
  const getRadarChartData = () => {
    // Normalize data to 0-100 scale for radar
    const normalizeValue = (value, metric) => {
      switch(metric) {
        case 'Productivity':
          return value; // Already 0-100
        case 'Focus Time':
          return Math.min(value * 10, 100); // 0-10 hours → 0-100
        case 'Distractions':
          return 100 - value; // Lower is better, so invert
        case 'Task Switching':
          return 100 - (value * 10); // Lower is better, so invert
        case 'Flow Score':
          return value; // Already 0-100
        default:
          return value;
      }
    };
    
    return [
      {
        metric: 'Productivity',
        you: normalizeValue(userData.productivity, 'Productivity'),
        peer: normalizeValue(comparisonData.productivity, 'Productivity'),
        fullMark: 100
      },
      {
        metric: 'Focus Time',
        you: normalizeValue(userData.focusTime, 'Focus Time'),
        peer: normalizeValue(comparisonData.focusTime, 'Focus Time'),
        fullMark: 100
      },
      {
        metric: 'Distractions',
        you: normalizeValue(userData.distractions, 'Distractions'),
        peer: normalizeValue(comparisonData.distractions, 'Distractions'),
        fullMark: 100
      },
      {
        metric: 'Task Switching',
        you: normalizeValue(userData.taskSwitching, 'Task Switching'),
        peer: normalizeValue(comparisonData.taskSwitching, 'Task Switching'),
        fullMark: 100
      },
      {
        metric: 'Flow Score',
        you: normalizeValue(userData.flowScore, 'Flow Score'),
        peer: normalizeValue(comparisonData.flowScore, 'Flow Score'),
        fullMark: 100
      }
    ];
  };
  
  // Calculate overall comparison score (positive means user is better)
  const calculateComparisonScore = () => {
    // Weight factors
    const weights = {
      productivity: 0.25,
      focusTime: 0.2,
      distractions: 0.2,
      taskSwitching: 0.15,
      flowScore: 0.2
    };
    
    // For distractions and task switching, lower is better
    const distractionScore = (comparisonData.distractions - userData.distractions) * weights.distractions;
    const taskSwitchingScore = (comparisonData.taskSwitching - userData.taskSwitching) * weights.taskSwitching;
    
    // For others, higher is better
    const productivityScore = (userData.productivity - comparisonData.productivity) * weights.productivity;
    const focusTimeScore = (userData.focusTime - comparisonData.focusTime) * weights.focusTime;
    const flowScore = (userData.flowScore - comparisonData.flowScore) * weights.flowScore;
    
    // Combined score
    return Math.round((productivityScore + focusTimeScore + distractionScore + taskSwitchingScore + flowScore) * 100);
  };
  
  // Get icon for specific metric
  const getMetricIcon = (metric) => {
    switch(metric) {
      case 'Productivity':
        return <ChartBarIcon className="h-4 w-4 text-indigo-500" />;
      case 'Focus Time':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'Distractions':
        return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />;
      case 'Task Switching':
        return <ArrowsRightLeftIcon className="h-4 w-4 text-purple-500" />;
      case 'Flow Score':
        return <BoltIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <QuestionMarkCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Format metric value with suffix
  const formatMetricValue = (value, metric) => {
    switch(metric) {
      case 'Focus Time':
        return `${value}h`;
      case 'Distractions':
      case 'Productivity':
        return `${value}%`;
      case 'Task Switching':
        return `${value}/hr`;
      default:
        return value;
    }
  };
  
  // Get comparison status
  const getComparisonStatus = (metric, userValue, peerValue) => {
    // For distractions and task switching, lower is better
    if (metric === 'Distractions' || metric === 'Task Switching') {
      if (userValue < peerValue) return 'better';
      if (userValue > peerValue) return 'worse';
      return 'same';
    } 
    
    // For others, higher is better
    if (userValue > peerValue) return 'better';
    if (userValue < peerValue) return 'worse';
    return 'same';
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'better':
        return 'text-green-600 dark:text-green-400';
      case 'worse':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Bar chart data
  const barChartData = getBarChartData();
  
  // Radar chart data
  const radarChartData = getRadarChartData();
  
  // Comparison score
  const comparisonScore = calculateComparisonScore();
  
  return (
    <Card className="overflow-hidden" animate={true}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <UsersIcon className="h-5 w-5 mr-2 text-blue-500" />
            Peer Comparison
          </h2>
          
          {/* Chart type selector */}
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button 
              variant={chartType === 'bar' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Bar Chart
            </Button>
            <Button 
              variant={chartType === 'radar' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setChartType('radar')}
            >
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              Radar Chart
            </Button>
          </div>
        </div>
        
        {/* Comparison selectors */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setComparisonGroup('industry')}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${comparisonGroup === 'industry' ? 
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <BuildingOfficeIcon className="h-4 w-4 mr-1.5" />
            Industry Average
          </button>
          
          <button
            onClick={() => setComparisonGroup('role')}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${comparisonGroup === 'role' ? 
                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <BriefcaseIcon className="h-4 w-4 mr-1.5" />
            Similar Roles
          </button>
          
          <button
            onClick={() => setComparisonGroup('top')}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${comparisonGroup === 'top' ? 
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1.5" />
            Top Performers
          </button>
        </div>
        
        {/* Comparison description */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg mr-3 mt-1">
              <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Comparing with: {comparisonData.name}</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{comparisonData.description}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800/50">
            <div className="flex items-center">
              <div className={`text-lg font-bold ${comparisonScore > 0 ? 'text-green-600 dark:text-green-400' : comparisonScore < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {comparisonScore > 0 ? '+' : ''}{comparisonScore}%
              </div>
              <span className="mx-2 text-blue-700 dark:text-blue-400">•</span>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {comparisonScore > 15 ? 
                  "You're significantly outperforming the comparison group!" :
                 comparisonScore > 0 ? 
                  "You're doing better than the comparison group." :
                 comparisonScore > -15 ? 
                  "You're slightly behind the comparison group." :
                  "You have significant room for improvement compared to this group."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Main chart area */}
        <div className="h-80 mb-6">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={barChartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    const metricName = props.payload.name;
                    const suffix = props.payload.suffix;
                    return [`${value}${suffix}`, name === 'you' ? 'You' : comparisonData.name];
                  }}
                />
                <Legend formatter={(value) => value === 'you' ? 'You' : comparisonData.name} />
                <Bar dataKey="peer" fill="#94a3b8" name="peer" maxBarSize={20} />
                <Bar dataKey="you" fill="#3b82f6" name="you" maxBarSize={20}>
                  {barChartData.map((entry, index) => {
                    const status = getComparisonStatus(
                      entry.name, 
                      entry.you, 
                      entry.peer
                    );
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={status === 'better' ? '#10b981' : 
                             status === 'worse' ? '#ef4444' : 
                             '#3b82f6'} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} width={730} height={250} data={radarChartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar 
                  name="You" 
                  dataKey="you" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  name={comparisonData.name} 
                  dataKey="peer" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.3} 
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Metric breakdown */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Metric Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barChartData.map((metric) => {
            const status = getComparisonStatus(
              metric.name, 
              metric.you, 
              metric.peer
            );
            
            return (
              <div key={metric.name} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getMetricIcon(metric.name)}
                    <h4 className="ml-2 font-medium text-gray-900 dark:text-gray-100">{metric.name}</h4>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                    status === 'better' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    status === 'worse' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {status === 'better' ? 'Better' : status === 'worse' ? 'Needs Work' : 'Same'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">You</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatMetricValue(metric.you, metric.name)}
                    </p>
                  </div>
                  
                  <div className={`flex items-center ${getStatusColor(status)}`}>
                    {status === 'better' ? 
                      <span>+{((metric.you / metric.peer - 1) * 100).toFixed(0)}%</span> :
                     status === 'worse' ? 
                      <span>-{((1 - metric.you / metric.peer) * 100).toFixed(0)}%</span> :
                      <span>Same</span>}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{comparisonData.name}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatMetricValue(metric.peer, metric.name)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default PeerComparison;
import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router'; // Add Next.js router
import { Pie } from 'react-chartjs-2';
import { formatDuration } from '@tempos-ai/shared';
import Card from '../common/Card';
import Button from '../common/Button';

export default function SiteActivityReport() {
  const [siteData, setSiteData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('day'); // 'day', 'week', 'month'
  const [showExtensionPrompt, setShowExtensionPrompt] = useState(false);
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter(); // Initialize Next.js router
  
  // Load site activity data
  useEffect(() => {
    if (!user) return;
    
    async function loadSiteActivity() {
      setIsLoading(true);
      
      try {
        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        
        switch (timeRange) {
          case 'day':
            startDate.setHours(0, 0, 0, 0); // Start of today
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          default:
            startDate.setHours(0, 0, 0, 0); // Default to today
        }
        
        // Fetch site activity
        const { data, error } = await supabase
          .from('site_activities')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // If no data and this is the first load, show extension prompt
        if ((!data || data.length === 0) && isLoading) {
          setShowExtensionPrompt(true);
        }
        
        setSiteData(data || []);
      } catch (err) {
        console.error('Error loading site activity:', err);
        setError('Failed to load site activity data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSiteActivity();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('site_activities_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_activities',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        loadSiteActivity();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabase, timeRange]);
  
  // Aggregate data by domain
  const domainData = React.useMemo(() => {
    if (!siteData.length) return { domains: [], durations: [] };
    
    const domainMap = new Map();
    
    siteData.forEach(entry => {
      if (!domainMap.has(entry.domain)) {
        domainMap.set(entry.domain, 0);
      }
      
      domainMap.set(entry.domain, domainMap.get(entry.domain) + entry.duration);
    });
    
    // Sort domains by duration (descending)
    const sortedDomains = [...domainMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 domains
      
    return {
      domains: sortedDomains.map(([domain]) => domain),
      durations: sortedDomains.map(([_, duration]) => duration),
    };
  }, [siteData]);
  
  // Prepare chart data
  const chartData = React.useMemo(() => {
    return {
      labels: domainData.domains,
      datasets: [
        {
          data: domainData.durations,
          backgroundColor: [
            '#3B82F6', // blue
            '#10B981', // green
            '#F59E0B', // amber
            '#EF4444', // red
            '#8B5CF6', // purple
            '#EC4899', // pink
            '#6B7280', // gray
            '#14B8A6', // teal
            '#6366F1', // indigo
            '#F97316', // orange
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [domainData]);
  
  // Chart options
  const chartOptions = {
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
            return `${context.label}: ${formatDuration(value)}`;
          },
        },
      },
    },
  };
  
  // Site categories (for potential filtering)
  const categories = {
    'github.com': 'Development',
    'stackoverflow.com': 'Development',
    'atlassian.net': 'Work',
    'slack.com': 'Communication',
    'gmail.com': 'Email',
    'google.com': 'Search',
    'docs.google.com': 'Documents',
    'facebook.com': 'Social Media',
    'twitter.com': 'Social Media',
    'instagram.com': 'Social Media',
    'youtube.com': 'Entertainment',
    'netflix.com': 'Entertainment',
  };
  
  // Get domain category
  const getDomainCategory = (domain) => {
    for (const [key, category] of Object.entries(categories)) {
      if (domain.includes(key)) {
        return category;
      }
    }
    return 'Other';
  };
  
  // Handle extension setup navigation with Next.js router
  const handleSetupExtension = () => {
    router.push('/extension-setup');
  };
  
  if (showExtensionPrompt) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Site Activity</h2>
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Browser Extension Not Installed</h3>
          <p className="mt-1 text-gray-500 max-w-md mx-auto">
            Install our browser extension to track site activity and get more detailed productivity insights.
          </p>
          <div className="mt-4">
            <Button onClick={handleSetupExtension}>
              Set Up Extension
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Site Activity</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Site Activity</h2>
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          {error}
        </div>
      </Card>
    );
  }
  
  if (!siteData.length) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Site Activity</h2>
        <div className="text-center py-8 text-gray-500">
          No site activity recorded for this period.
        </div>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Site Activity</h2>
        
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === 'day' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('day')}
          >
            Today
          </Button>
          <Button 
            variant={timeRange === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64">
          <Pie data={chartData} options={chartOptions} />
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Top Websites</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
            {domainData.domains.map((domain, index) => (
              <div key={domain} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                <div>
                  <div className="font-medium">{domain}</div>
                  <div className="text-xs text-gray-500">{getDomainCategory(domain)}</div>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDuration(domainData.durations[index])}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This data is collected via the Tempu Task browser extension and is only visible to you.</p>
      </div>
    </Card>
  );
}
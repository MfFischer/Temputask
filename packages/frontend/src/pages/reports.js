import React, { useContext, useState, useRef, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AuthContext } from '../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SiteActivityReport from '../components/reports/SiteActivityReport';
import ReportControls from '../components/reports/ReportControls';
import TimeDistributionChart from '../components/reports/TimeDistributionChart';
import ProductivityChart from '../components/reports/ProductivityChart';
import ImprovedReportControls from '../components/reports/ImprovedReportControls';
import ClientReportExportModal from '../components/reports/ClientReportExportModal';
import { generateBillableReport, generateBillableCSV } from '../utils/reportGenerators';
import { saveAs } from 'file-saver';
import ExportModal from '../components/reports/ExportModal';

export default function ReportsPage() {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const supabase = useSupabaseClient();
  const [activeTab, setActiveTab] = useState('productivity'); // 'productivity', 'time', 'invoices'
  const [dateRange, setDateRange] = useState('week'); 
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null
  });
  const [filters, setFilters] = useState({
    project: null,
    company: null,
    billable: null,
    reportType: 'summary'
  });
  
  // States for various data
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Ref for the printable report content
  const reportRef = useRef(null);
  
  // Create a very simple direct print function
  const handleDirectPrint = () => {
    console.log("Direct print triggered");
    
    // Add a temporary class to the body to control print styles
    document.body.classList.add('printing-report');
    document.body.setAttribute('data-print-tab', activeTab);
    
    // Use setTimeout to ensure the class is applied before printing
    setTimeout(() => {
      window.print();
      
      // Remove the class after printing
      setTimeout(() => {
        document.body.classList.remove('printing-report');
        document.body.removeAttribute('data-print-tab');
      }, 500);
    }, 100);
  };
  
  // Handle PDF export
  // Enhanced PDF export function with better error handling
  const handleExportPDF = async () => {
    try {
      // Validate that we have the necessary data before attempting to generate
      if (!filteredEntries || filteredEntries.length === 0) {
        alert('No entries to include in the PDF. Please adjust your filters.');
        return;
      }
      
      if (!dateRangeInfo || !dateRangeInfo.startDate || !dateRangeInfo.endDate) {
        alert('Invalid date range for PDF generation.');
        return;
      }
      
      // Log what we're trying to generate
      console.log('Generating PDF with:', {
        entriesCount: filteredEntries.length,
        dateRange: {
          start: dateRangeInfo.startDate.toISOString(),
          end: dateRangeInfo.endDate.toISOString()
        },
        filters
      });
      
      // Add a timeout in case the PDF generation takes too long
      const pdfPromise = generateBillableReport(
        filteredEntries,
        {
          startDate: dateRangeInfo.startDate,
          endDate: dateRangeInfo.endDate,
          projectId: filters.project,
          companyId: filters.company,
          includeBillableOnly: filters.billable === 'billable'
        },
        {
          currency: '$',
          includeActivities: true,
          includeTerms: false
        }
      );
      
      // Set a timeout to prevent the function from hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PDF generation timed out after 30 seconds')), 30000);
      });
      
      const pdfBlob = await Promise.race([pdfPromise, timeoutPromise]);
      
      if (!pdfBlob || !(pdfBlob instanceof Blob)) {
        throw new Error('PDF generation failed: Invalid response format');
      }
      
      // Save the file
      saveAs(pdfBlob, `Tempu-Task-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      // Detailed error logging
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        type: error.name,
      });
      
      // More helpful error message to the user
      if (error.message.includes('timed out')) {
        alert('PDF generation timed out. The report may be too large or the server is busy. Please try with fewer entries or try again later.');
      } else if (error.message.includes('network') || error.code === 'NETWORK_ERROR') {
        alert('Network error while generating PDF. Please check your connection and try again.');
      } else {
        alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please try again.`);
      }
    }
  };

  // State for email export modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Fetch data
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch time entries
        const { data: entriesData, error: entriesError } = await supabase
          .from('time_entries')
          .select(`
            *,
            projects:project_id(id, name, color, company_id, default_hourly_rate),
            activities:activity_id(id, name, hourly_rate)
          `)
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });
          
        if (entriesError) throw entriesError;
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id);
          
        if (projectsError) throw projectsError;
        
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id);
          
        if (companiesError) throw companiesError;
        
        // Fetch company profile
        const { data: profileData, error: profileError } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        // Don't throw on profile error - it might not exist yet
        
        // Fetch invoices if they exist
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        // Set data
        setTimeEntries(entriesData || []);
        setProjects(projectsData || []);
        setCompanies(companiesData || []);
        if (profileData) setCompanyProfile(profileData);
        if (invoicesData) setInvoices(invoicesData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, supabase]);
  
  // Prepare the date range information
  const getDateRangeInfo = () => {
    const now = new Date();
    let startDate, endDate;
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          startDate = new Date(customDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Default to this week if custom range is not complete
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
    }
    
    return { startDate, endDate };
  };
  
  // Filter time entries based on date range and other filters
  const getFilteredTimeEntries = () => {
    const { startDate, endDate } = getDateRangeInfo();
    
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      
      // Date filter
      if (entryDate < startDate || entryDate > endDate) {
        return false;
      }
      
      // Project filter
      if (filters.project && entry.project_id !== filters.project) {
        return false;
      }
      
      // Company filter
      if (filters.company && (!entry.projects || entry.projects.company_id !== filters.company)) {
        return false;
      }
      
      // Billable filter
      if (filters.billable === 'billable' && !entry.billable) {
        return false;
      }
      
      if (filters.billable === 'non-billable' && entry.billable) {
        return false;
      }
      
      return true;
    });
  };
  
  const dateRangeInfo = getDateRangeInfo();
  const filteredEntries = getFilteredTimeEntries();
  
  // Calculate summary stats - UPDATED to correctly handle distractions
  const calculateSummary = () => {
    const totalDuration = filteredEntries.reduce((acc, entry) => 
      acc + (entry.duration || 0), 0);
    
    // UPDATED: Calculate productive time - anything NOT marked as Distraction
    const productiveTime = filteredEntries
      .filter(entry => entry.category !== 'Distraction')
      .reduce((acc, entry) => acc + (entry.duration || 0), 0);
    
    // UPDATED: Calculate distraction time - only entries explicitly marked as Distraction
    const distractionTime = filteredEntries
      .filter(entry => entry.category === 'Distraction')
      .reduce((acc, entry) => acc + (entry.duration || 0), 0);
    
    const billableDuration = filteredEntries
      .filter(entry => entry.billable)
      .reduce((acc, entry) => acc + (entry.duration || 0), 0);
    
    const billableAmount = filteredEntries
      .filter(entry => entry.billable)
      .reduce((acc, entry) => {
        const hourlyRate = entry.hourly_rate || 
                          (entry.activities && entry.activities.hourly_rate) || 
                          (entry.projects && entry.projects.default_hourly_rate) || 0;
                          
        return acc + (hourlyRate * (entry.duration / 3600));
      }, 0);
    
    // Group by project for project percentages
    const projectDurations = {};
    filteredEntries.forEach(entry => {
      const projectId = entry.project_id;
      if (!projectDurations[projectId]) {
        projectDurations[projectId] = 0;
      }
      projectDurations[projectId] += entry.duration || 0;
    });
    
    // UPDATED: Get distraction groups for top distractions
    const distractionGroups = {};
    filteredEntries
      .filter(entry => entry.category === 'Distraction')
      .forEach(entry => {
        const description = entry.description || 'Other';
        if (!distractionGroups[description]) {
          distractionGroups[description] = 0;
        }
        distractionGroups[description] += entry.duration || 0;
      });
    
    // Convert groups to sorted array
    const topDistractions = Object.entries(distractionGroups)
      .map(([name, duration]) => ({ name, duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 3); // Get top 3
    
    // Convert all to hours
    const totalHours = totalDuration / 3600;
    const billableHours = billableDuration / 3600;
    const productiveHours = productiveTime / 3600;
    const distractionHours = distractionTime / 3600;
    
    // Calculate productivity score
    const productivityScore = totalDuration ? 
      Math.round((productiveTime / totalDuration) * 100) : 0;
    
    return {
      totalHours,
      billableHours,
      productiveHours,
      distractionHours,
      billableAmount,
      productivityScore,
      projectDurations,
      topDistractions
    };
  };
  
  const summary = calculateSummary();
  
  // Format duration as hours and minutes
  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };
  
  // Handle creating a new invoice
  const handleCreateInvoice = async (data) => {
    try {
      // First generate the invoice PDF
      const pdfBlob = await generateBillableReport(
        filteredEntries,
        {
          startDate: dateRangeInfo.startDate,
          endDate: dateRangeInfo.endDate,
          projectId: data.filters.project,
          companyId: data.filters.company,
          includeBillableOnly: data.options.includeBillableOnly !== false,
          companyInfo: companyProfile || {}
        },
        data.options
      );
      
      // Convert blob to Base64 for storage
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        // Create invoice record
        const { data: invoice, error } = await supabase
          .from('invoices')
          .insert({
            user_id: user.id,
            client_id: data.filters.company,
            project_id: data.filters.project,
            amount: summary.billableAmount,
            status: 'draft',
            start_date: dateRangeInfo.startDate.toISOString(),
            end_date: dateRangeInfo.endDate.toISOString(),
            invoice_number: `INV-${Date.now().toString().substring(7)}`,
            title: data.options.reportTitle || 'Invoice',
            notes: data.options.terms || '',
            pdf_data: base64data,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update invoices list
        setInvoices(prev => [invoice, ...prev]);
        
        // If email was provided, send it
        if (data.email) {
          // Call email API
          const emailResponse = await fetch('/api/reports/emailReport', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
              format: data.options.format,
              schedule: data.schedule,
              filters: data.filters,
              options: data.options,
              invoiceId: invoice.id
            }),
          });
          
          if (!emailResponse.ok) {
            throw new Error('Failed to send invoice email');
          }
        }
        
        // Download the invoice if no email specified
        if (!data.email) {
          saveAs(pdfBlob, `${data.options.reportTitle || 'Invoice'}-${new Date().toISOString().slice(0, 10)}.pdf`);
        }
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  };
  
  // Show loading state
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 no-print">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Billing</h1>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 no-print">
        <div className="flex flex-wrap -mb-px">
          <button
            onClick={() => setActiveTab('productivity')}
            className={`inline-block p-4 rounded-t-lg border-b-2 ${
              activeTab === 'productivity'
                ? 'text-primary-600 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            }`}
          >
            Productivity Reports
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`inline-block p-4 rounded-t-lg border-b-2 ${
              activeTab === 'time'
                ? 'text-primary-600 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            }`}
          >
            Time Reports
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`inline-block p-4 rounded-t-lg border-b-2 ${
              activeTab === 'invoices'
                ? 'text-primary-600 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            }`}
          >
            Invoices & Billing
          </button>
        </div>
      </div>

      {/* Simple Direct Print Button */}
      <div className="mb-4 no-print">
        <button
          onClick={handleDirectPrint}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
        >
          Print {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report
        </button>
      </div>
      
      {/* Report Controls - Modified to remove redundant elements */}
      <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Report Options</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDateRange('today')}
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === 'today'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('yesterday')}
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === 'yesterday'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => setDateRange('week')}
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === 'week'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === 'month'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                This Month
              </button>
            </div>
          </div>
          
          <div className="space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
            <select
              className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-sm"
              value={filters.reportType || "summary"}
              onChange={(e) => setFilters({...filters, reportType: e.target.value})}
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="activity">Site Activity</option>
            </select>
            
            {/* Download PDF button */}
            <Button 
              variant="outline" 
              className="inline-flex items-center"
              onClick={handleExportPDF}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </Button>

            {/* Email Report button */}
            <Button 
              variant="primary" 
              className="inline-flex items-center" 
              onClick={() => setShowEmailModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Report
            </Button>
          </div>
        </div>
        
        {/* Filters section */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {/* Projects filter */}
            <select
              className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-sm"
              value={filters.project || ""}
              onChange={(e) => setFilters({...filters, project: e.target.value || null})}
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            
            {/* Companies filter */}
            <select
              className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-sm"
              value={filters.company || ""}
              onChange={(e) => setFilters({...filters, company: e.target.value || null})}
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            
            {/* Billable filter */}
            <select
              className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-sm"
              value={filters.billable || ""}
              onChange={(e) => setFilters({...filters, billable: e.target.value || null})}
            >
              <option value="">All Time</option>
              <option value="billable">Billable Only</option>
              <option value="non-billable">Non-Billable Only</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Productivity Reports Tab */}
      {activeTab === 'productivity' && (
        <div className="space-y-8 printable-report" data-report-type="productivity">
          {/* Report Header - Only visible when printing */}
          <div className="hidden print-only mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Productivity Report</h1>
            <p className="text-center text-gray-600">
              {dateRangeInfo.startDate.toLocaleDateString()} to {dateRangeInfo.endDate.toLocaleDateString()}
            </p>
            <p className="text-center text-gray-600 mb-4">
              Generated on {new Date().toLocaleString()}
            </p>
            <hr className="my-4" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Productivity Overview */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Productivity Overview</h2>
                <div className="h-64">
                  <ProductivityChart dateRange={dateRangeInfo} filters={filters} />
                </div>
              </Card>
              
              {/* Time Distribution */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Time Distribution</h2>
                <div className="h-64">
                  <TimeDistributionChart dateRange={dateRangeInfo} filters={filters} />
                </div>
              </Card>
              
              {/* Site Activity Report */}
              <SiteActivityReport dateRange={dateRange} customDateRange={customDateRange} />
            </div>
            
            <div className="space-y-8">
              {/* Summary Stats */}
              <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800">
                <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                  Summary
                </h2>
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Productive Time</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">{formatDuration(summary.productiveHours)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Distraction Time</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">{formatDuration(summary.distractionHours)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Productivity Score</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">{summary.productivityScore}%</p>
                  </div>
                </div>
              </Card>
              
              {/* Most Productive Day */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Most Productive Day</h2>
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Tuesday</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">3h 45m of focused work</p>
                </div>
              </Card>
              
              {/* Top Distractions - UPDATED to use actual data */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top Distractions</h2>
                {summary.topDistractions && summary.topDistractions.length > 0 ? (
                  <ul className="space-y-3">
                    {summary.topDistractions.map((distraction, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{distraction.name}</span>
                        <span className="text-red-500 dark:text-red-400 font-medium">
                          {formatDuration(distraction.duration / 3600)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-2">
                    No distractions recorded in this period
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
      
      {/* Time Reports Tab */}
      {activeTab === 'time' && (
        <div className="space-y-8 printable-report" data-report-type="time">
          {/* Report Header - Only visible when printing */}
          <div className="hidden print-only mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Time Report</h1>
            <p className="text-center text-gray-600">
              {dateRangeInfo.startDate.toLocaleDateString()} to {dateRangeInfo.endDate.toLocaleDateString()}
            </p>
            <p className="text-center text-gray-600 mb-4">
              Generated on {new Date().toLocaleString()}
            </p>
            <hr className="my-4" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Time Distribution */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Time Distribution</h2>
                <div className="h-64">
                  <TimeDistributionChart dateRange={dateRangeInfo} filters={filters} />
                </div>
              </Card>
              
              {/* Detailed Time Entries */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Detailed Time Entries</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
                        {filters.company && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Activity</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Billable</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
                      {filteredEntries.length > 0 ? (
                        filteredEntries.map(entry => (
                          <tr key={entry.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {new Date(entry.start_time).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {entry.projects?.name || 'Unknown Project'}
                            </td>
                            {filters.company && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {/* Need to fetch company name from project */}
                                {entry.projects?.company?.name || 'N/A'}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {entry.activities?.name || 'General'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatDuration(entry.duration / 3600)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {entry.billable ? 'Yes' : 'No'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No time entries found for the selected period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
            
            <div className="space-y-8">
              {/* Summary Stats */}
              <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800">
                <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Time Summary
                </h2>
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Time</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">{formatDuration(summary.totalHours)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Billable Time</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">{formatDuration(summary.billableHours)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Billable Amount</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">${summary.billableAmount.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
              
              {/* Time Entry Actions */}
              <Card className="p-6 no-print">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Actions</h2>
                <div className="space-y-4">
                  <Button 
                    onClick={() => setShowInvoiceModal(true)} 
                    className="w-full"
                  >
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Create Invoice
                    </span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const csvBlob = generateBillableCSV(
                        filteredEntries,
                        {
                          startDate: dateRangeInfo.startDate,
                          endDate: dateRangeInfo.endDate,
                          projectId: filters.project,
                          companyId: filters.company
                        }
                      );
                      saveAs(csvBlob, `Time-Entries-${new Date().toISOString().slice(0, 10)}.csv`);
                    }}
                  >
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export to CSV
                    </span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
      
      {/* Invoices & Billing Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-8 printable-report" data-report-type="invoices">
          {/* Report Header - Only visible when printing */}
          <div className="hidden print-only mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Invoices & Billing</h1>
            <p className="text-center text-gray-600 mb-4">
              Generated on {new Date().toLocaleString()}
            </p>
            <hr className="my-4" />
          </div>
          
          <div className="flex justify-between items-center no-print">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoices</h2>
            <Button onClick={() => setShowInvoiceModal(true)}>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Invoice
              </span>
            </Button>
          </div>
          
          {invoices.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice #</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {invoices.map(invoice => {
                    // Find client name
                    const client = companies.find(c => c.id === invoice.client_id);
                    
                    return (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {client?.name || 'Unknown Client'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          ${invoice.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : invoice.status === 'sent'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                          <button
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                            onClick={() => {
                              // View invoice - decode base64 PDF and display
                              const byteCharacters = atob(invoice.pdf_data);
                              const byteNumbers = new Array(byteCharacters.length);
                              for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                              }
                              const byteArray = new Uint8Array(byteNumbers);
                              const file = new Blob([byteArray], { type: 'application/pdf' });
                              const fileURL = URL.createObjectURL(file);
                              window.open(fileURL);
                            }}
                          >
                            View
                          </button>
                          <button
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                            onClick={() => {
                              // Send or resend invoice email
                              alert('This would send/resend the invoice via email');
                            }}
                          >
                            {invoice.status === 'draft' ? 'Send' : 'Resend'}
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            onClick={async () => {
                              // Mark as paid
                              if (invoice.status !== 'paid') {
                                const { error } = await supabase
                                  .from('invoices')
                                  .update({ status: 'paid' })
                                  .eq('id', invoice.id);
                                  
                                if (!error) {
                                  setInvoices(prev => 
                                    prev.map(inv => 
                                      inv.id === invoice.id ? { ...inv, status: 'paid' } : inv
                                    )
                                  );
                                }
                              }
                            }}
                            disabled={invoice.status === 'paid'}
                          >
                            {invoice.status === 'paid' ? 'Paid' : 'Mark Paid'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No invoices yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating your first invoice.
              </p>
              <div className="mt-6 no-print">
                <Button onClick={() => setShowInvoiceModal(true)}>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Invoice
                  </span>
                </Button>
              </div>
            </div>
          )}
          
          {/* Billing & Invoicing Settings */}
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Billing Settings</h2>
            
            {!companyProfile ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  To create professional invoices, set up your company profile first.
                </p>
                <Button 
                  onClick={() => window.location.href = '/settings/company-profile'}
                  variant="outline"
                  className="no-print"
                >
                  Set Up Company Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mr-4 flex items-center justify-center">
                    {companyProfile.logo_path ? (
                      <img 
                        src={`${supabase.supabaseUrl}/storage/v1/object/public/company-logos/${companyProfile.logo_path}`} 
                        alt={companyProfile.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{companyProfile.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{companyProfile.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{companyProfile.address}, {companyProfile.city}</p>
                  </div>
                </div>
                
                <div className="mt-2 no-print">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/settings/company-profile'}
                  >
                    Edit Company Profile
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Email Export Modal */}
      <ExportModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onExport={(emailData) => {
          // Implement email sending functionality
          fetch('/api/reports/emailReport', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: emailData.email,
              format: emailData.format,
              schedule: emailData.schedule,
              filters: filters,
              includeData: emailData.includeData
            }),
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to send email');
              }
              return response.json();
            })
            .then(() => {
              alert(`Report has been sent to ${emailData.email}`);
              setShowEmailModal(false);
            })
            .catch(error => {
              console.error('Error sending email report:', error);
              alert('Failed to send email. Please try again.');
            });
        }}
        isLoading={false}
        filters={filters}
      />
      
      {/* Invoice/Client Report Modal */}
      <ClientReportExportModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onExport={handleCreateInvoice}
        isLoading={false}
        filters={filters}
        projects={projects}
        companies={companies}
        className="no-print"
      />
    </div>
  );
}
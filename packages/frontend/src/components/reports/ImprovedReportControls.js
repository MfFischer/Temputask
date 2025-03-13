import React, { useState } from 'react';
import Button from '../common/Button';
import DateRangePicker from './DateRangePicker';
import ExportModal from './ExportModal';
import ClientReportExportModal from './ClientReportExportModal';
import { generateBillableReport, generateBillableCSV } from '../../utils/reportGenerators';
import { saveAs } from 'file-saver';

const ImprovedReportControls = ({ 
  dateRange, 
  setDateRange, 
  reportRef, 
  customDateRange, 
  setCustomDateRange,
  filters,
  setFilters,
  timeEntries = [],
  projects = [],
  companies = [],
  onPrint  // Add this prop for printing
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClientReportModal, setShowClientReportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [reportType, setReportType] = useState('internal'); // 'internal', 'client', 'activity'

  // Handle printing - now using the passed onPrint function
  const handlePrint = () => {
    console.log("Print button clicked"); // Add this for debugging
    if (onPrint) {
      onPrint();
    } else {
      // Fallback to window.print()
      window.print();
    }
  };

  // Handle standard PDF export
  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const pdfBlob = await generateBillableReport(
        timeEntries,
        {
          startDate: customDateRange.start || new Date(),
          endDate: customDateRange.end || new Date(),
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
      
      saveAs(pdfBlob, `Tempu-Task-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const csvBlob = generateBillableCSV(
        timeEntries,
        {
          startDate: customDateRange.start || new Date(),
          endDate: customDateRange.end || new Date(),
          projectId: filters.project,
          companyId: filters.company,
          includeBillableOnly: filters.billable === 'billable'
        }
      );
      
      saveAs(csvBlob, `Tempu-Task-Report-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Handle client report generation
  const handleClientReport = async (data) => {
    setExportLoading(true);
    try {
      if (data.email) {
        // Send via email
        const response = await fetch('/api/reports/emailReport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            format: data.options.format,
            schedule: data.schedule,
            filters: data.filters,
            options: data.options
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to send email');
        }
        
        alert(`Report has been sent to ${data.email}`);
      } else {
        // Download directly
        if (data.options.format === 'pdf') {
          const pdfBlob = await generateBillableReport(
            timeEntries,
            {
              startDate: customDateRange.start || new Date(),
              endDate: customDateRange.end || new Date(),
              projectId: data.filters.project,
              companyId: data.filters.company,
              includeBillableOnly: data.options.includeBillableOnly !== false
            },
            data.options
          );
          
          saveAs(pdfBlob, `${data.options.reportTitle || 'Billable-Hours'}-${new Date().toISOString().slice(0, 10)}.pdf`);
        } else if (data.options.format === 'csv' || data.options.format === 'excel') {
          const csvBlob = generateBillableCSV(
            timeEntries,
            {
              startDate: customDateRange.start || new Date(),
              endDate: customDateRange.end || new Date(),
              projectId: data.filters.project,
              companyId: data.filters.company,
              includeBillableOnly: data.options.includeBillableOnly !== false
            },
            data.options
          );
          
          saveAs(csvBlob, `${data.options.reportTitle || 'Billable-Hours'}-${new Date().toISOString().slice(0, 10)}.csv`);
        }
      }
    } catch (error) {
      console.error('Error generating client report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setExportLoading(false);
      setShowClientReportModal(false);
    }
  };

  // Handle email sending via standard export
  const handleEmailReport = (emailData) => {
    setExportLoading(true);
    // This would be an API call in production
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
        setShowExportModal(false);
      })
      .catch(error => {
        console.error('Error sending email report:', error);
        alert('Failed to send email. Please try again.');
      })
      .finally(() => {
        setExportLoading(false);
      });
  };

  return (
    <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 no-print">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Report Options</h2>
          <div className="flex flex-wrap gap-2">
            <DateRangePicker 
              dateRange={dateRange}
              setDateRange={setDateRange}
              customDateRange={customDateRange}
              setCustomDateRange={setCustomDateRange}
            />
          </div>
        </div>
        
        <div className="space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
          <select
            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-sm"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="internal">Internal Report</option>
            <option value="client">Client Billing Report</option>
            <option value="activity">Activity Report</option>
          </select>
          
          <Button 
            variant="outline" 
            onClick={handlePrint}
            disabled={exportLoading}
            className="inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </Button>
          
          {reportType === 'internal' ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={exportLoading}
                className="inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </Button>
              
              <Button 
                variant="primary" 
                onClick={() => setShowExportModal(true)}
                disabled={exportLoading}
                className="inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Report
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => setShowClientReportModal(true)}
              disabled={exportLoading}
              className="inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {reportType === 'client' ? 'Create Invoice Report' : 'Create Activity Report'}
            </Button>
          )}
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
            onChange={(e) => {
              console.log("Project selected:", e.target.value);
              setFilters({...filters, project: e.target.value || null});
            }}
          >
            <option value="">All Projects</option>
            {projects && projects.length > 0 ? (
              projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} {project.company_name ? `(${project.company_name})` : ''}
                </option>
              ))
            ) : (
              <option disabled>No projects available</option>
            )}
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
          
          {/* Report type */}
          <select
            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-sm"
            value={filters.reportType || "summary"}
            onChange={(e) => setFilters({...filters, reportType: e.target.value})}
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
            <option value="activity">Site Activity</option>
          </select>
        </div>
      </div>
      
      {/* Regular Export Modal */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleEmailReport}
        isLoading={exportLoading}
        filters={filters}
      />
      
      {/* Client Report Modal */}
      <ClientReportExportModal
        isOpen={showClientReportModal}
        onClose={() => setShowClientReportModal(false)}
        onExport={handleClientReport}
        isLoading={exportLoading}
        filters={filters}
        projects={projects}
        companies={companies}
      />
    </div>
  );
};

export default ImprovedReportControls;
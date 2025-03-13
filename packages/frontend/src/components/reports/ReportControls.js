import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import Button from '../common/Button';
import ExportModal from './ExportModal';
import DateRangePicker from './DateRangePicker';

const ReportControls = ({ 
  dateRange, 
  setDateRange, 
  reportRef, 
  customDateRange, 
  setCustomDateRange,
  filters,
  setFilters
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Tempu Task Report - ${new Date().toLocaleDateString()}`,
    onBeforeGetContent: () => {
      setExportLoading(true);
      return new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    },
    onAfterPrint: () => setExportLoading(false),
  });

  // Handle PDF export
  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Tempu-Task-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Handle email sending
  const handleEmailReport = (emailData) => {
    setExportLoading(true);
    // This would be an API call in production
    setTimeout(() => {
      console.log('Sending email with data:', emailData);
      alert(`Report has been sent to ${emailData.email}`);
      setExportLoading(false);
      setShowExportModal(false);
    }, 1500);
  };

  return (
    <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            <option value="project1">Project 1</option>
            <option value="project2">Project 2</option>
            <option value="project3">Project 3</option>
          </select>
          
          {/* Companies filter */}
          <select
            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-sm"
            value={filters.company || ""}
            onChange={(e) => setFilters({...filters, company: e.target.value || null})}
          >
            <option value="">All Companies</option>
            <option value="company1">Company 1</option>
            <option value="company2">Company 2</option>
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
      
      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleEmailReport}
        isLoading={exportLoading}
        filters={filters}
      />
    </div>
  );
};

export default ReportControls;
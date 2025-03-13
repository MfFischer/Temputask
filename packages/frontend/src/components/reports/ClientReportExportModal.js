import React, { useState } from 'react';
import Button from '../common/Button';

const ClientReportExportModal = ({ 
  isOpen, 
  onClose, 
  onExport, 
  isLoading, 
  filters,
  projects = [],
  companies = []
}) => {
  const [email, setEmail] = useState('');
  const [schedule, setSchedule] = useState('once');
  const [format, setFormat] = useState('pdf');
  const [selectedCompany, setSelectedCompany] = useState(filters.company || '');
  const [selectedProject, setSelectedProject] = useState(filters.project || '');
  const [reportTitle, setReportTitle] = useState('Billable Hours Report');
  const [includeOptions, setIncludeOptions] = useState({
    activities: true,
    nonBillable: false,
    descriptions: true,
    summary: true,
    terms: true
  });
  const [customTerms, setCustomTerms] = useState('Payment due within 30 days of receipt. Please make checks payable to Your Company Name or pay online at yourcompany.com/pay');
  const [currency, setCurrency] = useState(filters.currency || 'USD');
  const [logo, setLogo] = useState(null);
  
  // Available currencies
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ];
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare export options
    const exportOptions = {
      format,
      reportTitle,
      includeActivities: includeOptions.activities,
      includeBillableOnly: !includeOptions.nonBillable,
      includeDescriptions: includeOptions.descriptions,
      includeSummary: includeOptions.summary,
      includeTerms: includeOptions.terms,
      terms: customTerms,
      currency: getCurrencySymbol(currency),
      logo: logo,
    };
    
    // Prepare filters
    const exportFilters = {
      ...filters,
      company: selectedCompany || filters.company,
      project: selectedProject || filters.project,
    };
    
    onExport({
      email,
      schedule,
      options: exportOptions,
      filters: exportFilters
    });
  };
  
  const getCurrencySymbol = (code) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '$';
  };
  
  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = function(event) {
        setLogo(event.target.result);
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Client Billable Report
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                  placeholder="Billable Hours Report"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.symbol} {curr.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                >
                  <option value="">All Clients</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                >
                  <option value="">All Projects</option>
                  {projects
                    .filter(p => !selectedCompany || p.company_id === selectedCompany)
                    .map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-primary-600"
                    checked={format === 'pdf'}
                    onChange={() => setFormat('pdf')}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">PDF Document</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-primary-600"
                    checked={format === 'csv'}
                    onChange={() => setFormat('csv')}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">CSV (Spreadsheet)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-primary-600"
                    checked={format === 'excel'}
                    onChange={() => setFormat('excel')}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Excel</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content to Include
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600 rounded"
                    checked={includeOptions.activities}
                    onChange={() => setIncludeOptions({...includeOptions, activities: !includeOptions.activities})}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Activity Details</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600 rounded"
                    checked={includeOptions.nonBillable}
                    onChange={() => setIncludeOptions({...includeOptions, nonBillable: !includeOptions.nonBillable})}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include Non-Billable Time</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600 rounded"
                    checked={includeOptions.descriptions}
                    onChange={() => setIncludeOptions({...includeOptions, descriptions: !includeOptions.descriptions})}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Task Descriptions</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600 rounded"
                    checked={includeOptions.summary}
                    onChange={() => setIncludeOptions({...includeOptions, summary: !includeOptions.summary})}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Summary Section</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600 rounded"
                    checked={includeOptions.terms}
                    onChange={() => setIncludeOptions({...includeOptions, terms: !includeOptions.terms})}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Terms & Conditions</span>
                </label>
              </div>
            </div>
            
            {includeOptions.terms && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  value={customTerms}
                  onChange={(e) => setCustomTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                  rows={2}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Logo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
              />
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email To (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                placeholder="client@example.com"
              />
            </div>
            
            {email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Schedule
                </label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                >
                  <option value="once">Send Once (Now)</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {email ? 'Sending...' : 'Generating...'}
                  </span>
                ) : email ? 'Send Report' : 'Generate Report'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientReportExportModal;
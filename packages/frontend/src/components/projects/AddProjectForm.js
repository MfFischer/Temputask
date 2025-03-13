import React, { useState, useEffect } from 'react';

const AddProjectForm = ({ onSubmit, onCancel, initialData = null, companies = [] }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6'); // Default blue
  const [companyId, setCompanyId] = useState('');
  const [defaultHourlyRate, setDefaultHourlyRate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // New states for inline company creation
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyColor, setNewCompanyColor] = useState('#3B82F6');
  
  // Currency options
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  ];
  
  // Set initial data if editing
  useEffect(() => {
    if (initialData) {
      console.log('Initializing form with data:', initialData);
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setColor(initialData.color || '#3B82F6');
      setCompanyId(initialData.company_id || '');
      setDefaultHourlyRate(initialData.default_hourly_rate ? initialData.default_hourly_rate.toString() : '');
      setCurrency(initialData.currency || 'USD');
    }
  }, [initialData]);
  
  // Color options
  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Gray', value: '#6B7280' },
  ];
  
  // Handle company selection change
  const handleCompanyChange = (e) => {
    const value = e.target.value;
    if (value === 'new') {
      setShowNewCompanyForm(true);
    } else {
      setCompanyId(value);
    }
  };
  
  // Create a new company
  const handleCreateNewCompany = async () => {
    if (!newCompanyName.trim()) {
      setError('Company name is required');
      return;
    }
    
    try {
      const response = await fetch('/api/companies/createCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newCompanyName, 
          color: newCompanyColor 
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create company');
      }
      
      const { company } = await response.json();
      
      // Add the new company to the list and select it
      setCompanyId(company.id);
      setShowNewCompanyForm(false);
      setNewCompanyName('');
      
      // Return the created company so the parent component can update its state
      return company;
    } catch (err) {
      setError(`Failed to create company: ${err.message}`);
    }
  };
  
  // Validate form data
  const validateForm = () => {
    // Reset error
    setError('');
    
    // Check for required fields
    if (!name.trim()) {
      setError('Project name is required');
      return false;
    }
    
    // Validate hourly rate if provided
    if (defaultHourlyRate) {
      const rate = parseFloat(defaultHourlyRate);
      if (isNaN(rate) || rate < 0) {
        setError('Hourly rate must be a valid positive number');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', {
      name,
      description,
      color,
      company_id: companyId,
      default_hourly_rate: defaultHourlyRate,
      currency
    });
    
    if (!validateForm()) {
      console.error('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create company first if needed
      let finalCompanyId = companyId;
      if (showNewCompanyForm && newCompanyName.trim()) {
        const newCompany = await handleCreateNewCompany();
        if (newCompany) {
          finalCompanyId = newCompany.id;
        }
      }
      
      // Prepare the project data in the format expected by the parent component
      const projectData = {
        name: name,
        description: description,
        color: color,
        company_id: finalCompanyId || null,
        default_hourly_rate: defaultHourlyRate ? parseFloat(defaultHourlyRate) : null,
        currency: currency
      };
      
      console.log('Submitting project data to parent:', projectData);
      
      // Call the parent onSubmit with the project data
      await onSubmit(projectData);
      
      // Close the form on success
      onCancel();
    } catch (err) {
      setError('An unexpected error occurred: ' + err.message);
      console.error('Error submitting project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the currency symbol for the current selection
  const getCurrentCurrencySymbol = () => {
    const found = currencies.find(c => c.code === currency);
    return found ? found.symbol : '$';
  };
  
  // Cancel new company creation
  const cancelNewCompany = () => {
    setShowNewCompanyForm(false);
    setNewCompanyName('');
    setCompanyId('');
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        {initialData ? 'Edit Project' : 'Add New Project'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name*
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter project name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company (optional)
          </label>
          
          {!showNewCompanyForm ? (
            <div className="flex space-x-2">
              <select
                id="company"
                value={companyId}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">No Company</option>
                {companies && companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
                <option value="new">➕ Create New Company...</option>
              </select>
            </div>
          ) : (
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
              <div className="mb-3">
                <label htmlFor="newCompanyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Company Name*
                </label>
                <input
                  type="text"
                  id="newCompanyName"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter company name"
                  autoFocus
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewCompanyColor(option.value)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCompanyColor === option.value
                          ? 'border-gray-600 dark:border-gray-300'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: option.value }}
                      title={option.name}
                      aria-label={`Select ${option.name} color`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={cancelNewCompany}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Default Hourly Rate (optional)
          </label>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{getCurrentCurrencySymbol()}</span>
              </div>
              <input
                type="text"
                id="hourlyRate"
                value={defaultHourlyRate}
                onChange={(e) => setDefaultHourlyRate(e.target.value)}
                className="w-full pl-7 pr-12 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                aria-describedby="price-currency"
              />
            </div>
            <div className="col-span-2">
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter project description"
            rows={3}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Color
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                className={`w-8 h-8 rounded-full border-2 ${
                  color === option.value
                    ? 'border-gray-600 dark:border-gray-300'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: option.value }}
                title={option.name}
                aria-label={`Select ${option.name} color`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectForm;
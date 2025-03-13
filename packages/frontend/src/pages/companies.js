import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCompanies } from '../hooks/useCompanies';
import AddCompanyForm from '../components/projects/AddCompanyForm';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { BriefcaseIcon, FolderIcon, ChevronDownIcon, ChevronUpIcon, ChevronRightIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function CompaniesPage() {
  const supabase = useSupabaseClient();
  const { 
    companies, 
    isLoading, 
    error, 
    companyProjects,
    isLoadingProjects,
    fetchCompanyProjects,
    createCompany, 
    updateCompany, 
    deleteCompany 
  } = useCompanies();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('companies'); // 'companies' or 'profile'

  // Companies list state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
  // Company profile state
  const [companyProfile, setCompanyProfile] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    registrationNumber: '',
    defaultCurrency: 'USD',
    defaultTerms: 'Payment due within 30 days of receipt.',
    defaultNotes: '',
    defaultPaymentInstructions: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logo, setLogo] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  // Currencies for dropdown
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'JPY', name: 'Japanese Yen' }
  ];
  
  // Load company profile on mount
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        // Check if the companyProfiles endpoint exists
        const testResponse = await fetch('/api/companyProfiles/getCompanyProfile', { 
          method: 'HEAD' 
        }).catch(() => ({ ok: false }));
        
        if (testResponse.ok) {
          const response = await fetch('/api/companyProfiles/getCompanyProfile');
          
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              setCompanyProfile({
                name: data.profile.name || '',
                address: data.profile.address || '',
                city: data.profile.city || '',
                state: data.profile.state || '',
                zip: data.profile.zip || '',
                country: data.profile.country || '',
                phone: data.profile.phone || '',
                email: data.profile.email || '',
                website: data.profile.website || '',
                taxId: data.profile.tax_id || '',
                registrationNumber: data.profile.registration_number || '',
                defaultCurrency: data.profile.default_currency || 'USD',
                defaultTerms: data.profile.default_terms || 'Payment due within 30 days of receipt.',
                defaultNotes: data.profile.default_notes || '',
                defaultPaymentInstructions: data.profile.default_payment_instructions || ''
              });
              
              // If logo path exists, fetch the logo
              if (data.profile.logo_path) {
                const logoUrl = await supabase.storage
                  .from('company-logos')
                  .getPublicUrl(data.profile.logo_path);
                  
                if (logoUrl && logoUrl.data) {
                  setLogoPreview(logoUrl.data.publicUrl);
                }
              }
            }
          }
        }
        // If endpoint doesn't exist, we'll use default values
      } catch (err) {
        console.error('Error fetching company profile:', err);
        // Just use defaults, no need to show error
      }
    };
    
    fetchCompanyProfile();
  }, [supabase]);

  // Toggle sort direction or set new sort field
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort companies based on current sort field and direction
  const getSortedCompanies = () => {
    if (!companies) return [];
    
    return [...companies].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'projects':
          aValue = a.project_count || 0;
          bValue = b.project_count || 0;
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }
      
      // String comparison for string fields
      if (typeof aValue === 'string') {
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Numeric comparison for number fields
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };
  
  // Company Management
  const handleAddCompany = () => {
    setEditingCompany(null);
    setShowAddForm(true);
  };
  
  const handleEditCompany = (company) => {
    console.log('Editing company:', company);
    
    // Make a copy of the company to avoid reference issues
    const companyToEdit = {
      ...company,
      // Ensure all fields are properly formatted for the form
      name: company.name || '',
      description: company.description || '',
      color: company.color || '#3B82F6'
    };
    
    setEditingCompany(companyToEdit);
    setShowAddForm(true);
  };
  
  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingCompany(null);
  };
  
  const handleSubmitCompany = async (companyData) => {
    try {
      console.log('Company data to submit:', companyData);
      
      if (!companyData.name || companyData.name.trim() === '') {
        alert('Company name is required');
        return;
      }
      
      if (editingCompany) {
        // Update existing company
        const result = await updateCompany(editingCompany.id, companyData);
        console.log('Company updated:', result);
      } else {
        // Create new company
        const result = await createCompany(companyData);
        console.log('Company created:', result);
      }
      
      setShowAddForm(false);
      setEditingCompany(null);
    } catch (err) {
      console.error('Error submitting company:', err);
    }
  };
  
  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await deleteCompany(companyId);
      } catch (err) {
        console.error('Error deleting company:', err);
      }
    }
  };
  
  // Toggle company expansion to show projects
  const handleToggleCompany = async (companyId) => {
    if (expandedCompanyId === companyId) {
      // Collapse this company
      setExpandedCompanyId(null);
    } else {
      // Expand this company and fetch its projects
      setExpandedCompanyId(companyId);
      await fetchCompanyProjects(companyId);
    }
  };
  
  // Company Profile Management Functions
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      setIsSavingProfile(true);
      setError(null);
      setProfileSuccess(false);
      
      // Check if the API endpoint exists
      const testResponse = await fetch('/api/companyProfiles/updateCompanyProfile', { 
        method: 'HEAD' 
      }).catch(() => ({ ok: false }));
      
      if (!testResponse.ok) {
        throw new Error('Company profile API not implemented yet');
      }
      
      // Upload logo if changed
      let logoPath = null;
      if (logo) {
        const formData = new FormData();
        formData.append('logo', logo);
        
        const uploadResponse = await fetch('/api/companyProfiles/uploadLogo', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload company logo');
        }
        
        const uploadData = await uploadResponse.json();
        logoPath = uploadData.logoPath;
      }
      
      // Prepare profile data
      const profileData = {
        name: companyProfile.name,
        address: companyProfile.address,
        city: companyProfile.city,
        state: companyProfile.state,
        zip: companyProfile.zip,
        country: companyProfile.country,
        phone: companyProfile.phone,
        email: companyProfile.email,
        website: companyProfile.website,
        tax_id: companyProfile.taxId,
        registration_number: companyProfile.registrationNumber,
        default_currency: companyProfile.defaultCurrency,
        default_terms: companyProfile.defaultTerms,
        default_notes: companyProfile.defaultNotes,
        default_payment_instructions: companyProfile.defaultPaymentInstructions
      };
      
      // Add logo path if available
      if (logoPath) {
        profileData.logo_path = logoPath;
      }
      
      // Update profile
      const response = await fetch('/api/companyProfiles/updateCompanyProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company profile');
      }
      
      setProfileSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving company profile:', err);
      setError('Failed to save company profile: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  // Render loading state
  const renderLoading = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
  
  // Render error state
  const renderError = () => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"></div>
        <BriefcaseIcon className="absolute inset-0 m-auto h-10 w-10 text-indigo-500 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No companies yet</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first company to start organizing projects.</p>
      <button
        onClick={handleAddCompany}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Create Company
      </button>
    </div>
  );
  
  // Render projects for a company
  const renderCompanyProjects = (companyId) => {
    const projects = companyProjects[companyId] || [];
    
    if (isLoadingProjects) {
      return (
        <div className="py-4 px-8 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
            <span>Loading projects...</span>
          </div>
        </div>
      );
    }
    
    if (projects.length === 0) {
      return (
        <div className="py-4 px-8 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-center">
          No projects found for this company.
        </div>
      );
    }
    
    return (
      <div className="py-4 px-8 bg-gray-50 dark:bg-gray-700">
        <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Projects</h4>
        <ul className="space-y-2">
          {projects.map(project => (
            <li key={project.id} className="bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: project.color || '#3B82F6' }}
                ></div>
                <span className="font-medium">{project.name}</span>
                {project.stats && (
                  <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {formatTime(project.stats.totalTime)}
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-4 mt-1">{project.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Render list view for companies
  const renderListView = () => {
    const sortedCompanies = getSortedCompanies();
    
    return (
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="w-10 px-2 py-3"></th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Company Name</span>
                  {sortField === 'name' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                      }
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('projects')}
              >
                <div className="flex items-center">
                  <span>Projects</span>
                  {sortField === 'projects' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                      }
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedCompanies.map((company) => (
              <React.Fragment key={company.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-2 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleCompany(company.id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {expandedCompanyId === company.id ? (
                        <ChevronDownIcon className="h-5 w-5" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: company.color }}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                        {company.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {company.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FolderIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                      <span className="text-gray-900 dark:text-white">
                        {company.project_count || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedCompanyId === company.id && (
                  <tr>
                    <td colSpan="4" className="p-0">
                      {renderCompanyProjects(company.id)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render grid view (card layout)
  const renderGridView = () => {
    const sortedCompanies = getSortedCompanies();
    
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedCompanies.map((company) => (
          <div
            key={company.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <div 
              className="h-2" 
              style={{ backgroundColor: company.color }}
            ></div>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg dark:text-white mb-1">
                    {company.name}
                  </h3>
                  {company.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {company.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <FolderIcon className="h-3 w-3 mr-1" />
                    {company.project_count || 0} Projects
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleCompany(company.id)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="View projects"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEditCompany(company)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Edit company"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(company.id)}
                    className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    title="Delete company"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              
              {expandedCompanyId === company.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {renderCompanyProjects(company.id)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render company profile form
  const renderCompanyProfile = () => {
    return (
      <form onSubmit={handleSaveProfile}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {profileSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Company profile saved successfully!
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Business Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={companyProfile.name}
                  onChange={handleProfileInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                  placeholder="Your Company Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={companyProfile.address}
                  onChange={handleProfileInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                  placeholder="123 Business St"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={companyProfile.city}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={companyProfile.state}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={companyProfile.zip}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Zip Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={companyProfile.country}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Country"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={companyProfile.phone}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={companyProfile.email}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="contact@yourcompany.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={companyProfile.website}
                  onChange={handleProfileInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                  placeholder="https://yourcompany.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tax ID / VAT Number
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={companyProfile.taxId}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Tax ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Registration #
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={companyProfile.registrationNumber}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Registration Number"
                  />
                </div>
              </div>
            </div>
          </Card>
          
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Company Logo</h2>
              
              <div className="mb-4">
                {logoPreview ? (
                  <div className="relative w-64 h-32 mx-auto mb-2 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={logoPreview} 
                      alt="Company Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                      title="Remove Logo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-64 h-32 mx-auto mb-2 border rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md cursor-pointer text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </label>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  Recommended: 300 x 150 pixels, PNG or JPG
                </p>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Invoice Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Currency
                  </label>
                  <select
                    name="defaultCurrency"
                    value={companyProfile.defaultCurrency}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                  >
                    {currencies.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Payment Terms
                  </label>
                  <textarea
                    name="defaultTerms"
                    value={companyProfile.defaultTerms}
                    onChange={handleProfileInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Payment due within 30 days..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Instructions
                  </label>
                  <textarea
                    name="defaultPaymentInstructions"
                    value={companyProfile.defaultPaymentInstructions}
                    onChange={handleProfileInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Please make checks payable to..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    name="defaultNotes"
                    value={companyProfile.defaultNotes}
                    onChange={handleProfileInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Any additional notes to include on invoices..."
                  ></textarea>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={isSavingProfile}
          >
            {isSavingProfile ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Business Profile'}
          </Button>
        </div>
      </form>
    );
  };
  
  // Render companies based on the current view mode
  const renderCompanies = () => {
    if (isLoading) {
      return renderLoading();
    }

    if (error) {
      return renderError();
    }

    if (!companies || companies.length === 0) {
      return renderEmptyState();
    }

    return viewMode === 'list' ? renderListView() : renderGridView();
  };
  
  // Format time in hours:minutes
  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return '0h 0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Companies</h1>
        {activeTab === 'companies' && !showAddForm && companies.length > 0 && (
          <button
            onClick={handleAddCompany}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Company
          </button>
        )}
      </div>
      
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('companies')}
            className={`${
              activeTab === 'companies'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Companies
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Business Profile
          </button>
        </nav>
      </div>
      
      {activeTab === 'companies' ? (
        showAddForm ? (
          <AddCompanyForm
            onSubmit={handleSubmitCompany}
            onCancel={handleCancelForm}
            initialData={editingCompany}
          />
        ) : (
          <div>
            {/* View toggle */}
            <div className="mb-4 flex justify-end">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
            {renderCompanies()}
          </div>
        )
      ) : (
        renderCompanyProfile()
      )}
    </div>
  );
}
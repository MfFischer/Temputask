import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useCompanies = () => {
  const { user } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyProjects, setCompanyProjects] = useState({});
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Fetch companies on component mount or when user changes
  useEffect(() => {
    if (user) {
      fetchCompanies();
    } else {
      setCompanies([]);
      setIsLoading(false);
    }
  }, [user]);

  // Fetch all companies
  const fetchCompanies = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/companies/getCompanies?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch companies');
      }
      
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects for a specific company
  const fetchCompanyProjects = async (companyId) => {
    if (!user || !companyId) return [];
    
    setIsLoadingProjects(true);
    
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/projects/getProjects?company_id=${companyId}&stats=true&_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company projects');
      }
      
      const data = await response.json();
      
      setCompanyProjects(prev => ({
        ...prev,
        [companyId]: data.projects || []
      }));
      
      return data.projects || [];
    } catch (err) {
      console.error(`Error fetching projects for company ${companyId}:`, err);
      return [];
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Create a new company
  const createCompany = async (companyData) => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/companies/createCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create company');
      }
      
      const { company } = await response.json();
      
      const newCompany = {
        ...company,
        project_count: 0
      };
      
      setCompanies(prevCompanies => [newCompany, ...prevCompanies]);
      
      return newCompany;
    } catch (err) {
      console.error('Error creating company:', err);
      setError('Failed to create company');
      return null;
    }
  };

  // Update an existing company
  const updateCompany = async (companyId, updates) => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/companies/updateCompany', {
        method: 'POST', // Changed from PATCH to POST to match API endpoint
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: companyId, // Changed from company_id to id to match API expectations
          ...updates 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company');
      }
      
      const { company } = await response.json();
      
      // Preserve project_count when updating
      const existingCompany = companies.find(c => c.id === companyId);
      const updatedCompany = {
        ...company,
        project_count: existingCompany ? existingCompany.project_count : 0
      };
      
      // Update local state
      setCompanies(prevCompanies => 
        prevCompanies.map(c => c.id === updatedCompany.id ? updatedCompany : c)
      );
      
      return updatedCompany;
    } catch (err) {
      console.error('Error updating company:', err);
      setError('Failed to update company');
      return null;
    }
  };

  // Delete a company
  const deleteCompany = async (companyId) => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/companies/deleteCompany', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id: companyId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete company');
      }
      
      // Update local state
      setCompanies(prevCompanies => 
        prevCompanies.filter(c => c.id !== companyId)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Failed to delete company');
      return false;
    }
  };

  return {
    companies,
    isLoading,
    error,
    companyProjects,
    isLoadingProjects,
    fetchCompanies,
    fetchCompanyProjects,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
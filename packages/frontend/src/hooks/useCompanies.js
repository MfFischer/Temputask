import { useState, useEffect, useContext } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AuthContext } from '../contexts/AuthContext';

export const useCompanies = () => {
  const { user } = useContext(AuthContext);
  const supabase = useSupabaseClient();
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyProjects, setCompanyProjects] = useState({});
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Fetch companies directly from Supabase on component mount or when user changes
  useEffect(() => {
    if (user) {
      fetchCompanies();
    } else {
      setCompanies([]);
      setIsLoading(false);
    }
  }, [user]);

  // Fetch all companies directly from Supabase
  const fetchCompanies = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all companies for the authenticated user
      const { data, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (companiesError) {
        throw new Error(companiesError.message || 'Failed to fetch companies');
      }
      
      // For each company, get the count of associated projects
      const companiesWithProjectCounts = await Promise.all(
        data.map(async (company) => {
          const { count, error: countError } = await supabase
            .from('projects')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .eq('user_id', user.id);
          
          return {
            ...company,
            project_count: countError ? 0 : count || 0
          };
        })
      );
      
      setCompanies(companiesWithProjectCounts || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects for a specific company directly from Supabase
  const fetchCompanyProjects = async (companyId) => {
    if (!user || !companyId) return [];
    
    setIsLoadingProjects(true);
    
    try {
      // Get projects with stats
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', companyId);
      
      if (projectsError) {
        throw new Error(projectsError.message || 'Failed to fetch company projects');
      }
      
      // Get time entries stats for each project
      const projectsWithStats = await Promise.all(
        projectsData.map(async (project) => {
          // Get the total time for this project
          const { data: timeEntries, error: timeError } = await supabase
            .from('time_entries')
            .select('duration')
            .eq('project_id', project.id)
            .eq('user_id', user.id)
            .not('duration', 'is', null);
          
          const totalTime = timeError ? 0 : 
            timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
          
          return {
            ...project,
            stats: {
              totalTime
            }
          };
        })
      );
      
      setCompanyProjects(prev => ({
        ...prev,
        [companyId]: projectsWithStats || []
      }));
      
      return projectsWithStats || [];
    } catch (err) {
      console.error(`Error fetching projects for company ${companyId}:`, err);
      return [];
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Create a new company directly with Supabase
  const createCompany = async (companyData) => {
    if (!user) return null;
    
    try {
      // Add user_id to company data
      const newCompanyData = {
        ...companyData,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('companies')
        .insert(newCompanyData)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to create company');
      }
      
      const newCompany = {
        ...data,
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

  // Update an existing company directly with Supabase
  const updateCompany = async (companyId, updates) => {
    if (!user) return null;
    
    try {
      // Update in Supabase
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to update company');
      }
      
      // Preserve project_count when updating
      const existingCompany = companies.find(c => c.id === companyId);
      const updatedCompany = {
        ...data,
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

  // Delete a company directly with Supabase
  const deleteCompany = async (companyId) => {
    if (!user) return false;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)
        .eq('user_id', user.id);
      
      if (error) {
        throw new Error(error.message || 'Failed to delete company');
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
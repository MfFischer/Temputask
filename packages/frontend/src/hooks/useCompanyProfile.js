import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useCompanyProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch company profile on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchCompanyProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  // Fetch the company profile from the API
  const fetchCompanyProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/companyProfiles/getCompanyProfile');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company profile');
      }
      
      const data = await response.json();
      setProfile(data.profile || null);
    } catch (err) {
      console.error('Error fetching company profile:', err);
      setError('Failed to load company profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the company profile 
  const updateCompanyProfile = async (profileData) => {
    if (!user) return null;
    
    setIsSaving(true);
    setError(null);
    
    try {
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
      
      const data = await response.json();
      setProfile(data.profile);
      return data.profile;
    } catch (err) {
      console.error('Error updating company profile:', err);
      setError('Failed to update company profile: ' + err.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Upload company logo
  const uploadLogo = async (logoFile) => {
    if (!user || !logoFile) return null;
    
    setIsSaving(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      // Upload using XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();
      
      // Create a promise to handle the upload
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || 'Upload failed'));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });
      });
      
      // Start the upload
      xhr.open('POST', '/api/companyProfiles/uploadLogo');
      xhr.send(formData);
      
      // Wait for the upload to complete
      const result = await uploadPromise;
      
      // Update the profile state with the new logo info
      setProfile(prev => ({
        ...prev,
        logo_path: result.logoPath,
        logo_url: result.logoUrl
      }));
      
      return result;
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo: ' + err.message);
      return null;
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  // Format the profile data for form use (camelCase to match form fields)
  const getFormattedProfile = () => {
    if (!profile) return null;
    
    return {
      name: profile.name || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zip: profile.zip || '',
      country: profile.country || '',
      phone: profile.phone || '',
      email: profile.email || '',
      website: profile.website || '',
      taxId: profile.tax_id || '',
      registrationNumber: profile.registration_number || '',
      defaultCurrency: profile.default_currency || 'USD',
      defaultTerms: profile.default_terms || 'Payment due within 30 days of receipt.',
      defaultNotes: profile.default_notes || '',
      defaultPaymentInstructions: profile.default_payment_instructions || '',
      logoUrl: profile.logo_url || null,
      logoPath: profile.logo_path || null
    };
  };

  return {
    profile,
    formattedProfile: getFormattedProfile(),
    isLoading,
    error,
    isSaving,
    uploadProgress,
    fetchCompanyProfile,
    updateCompanyProfile,
    uploadLogo
  };
};
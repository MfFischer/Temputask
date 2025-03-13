import React, { useState, useEffect, useContext } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Card from '../common/Card';

const CompanyProfile = () => {
  const { user } = useContext(AuthContext);
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Company profile data
  const [profile, setProfile] = useState({
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
  
  // Currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'JPY', name: 'Japanese Yen' }
  ];
  
  // Fetch company profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch company profile from the database
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setProfile({
            name: data.name || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip: data.zip || '',
            country: data.country || '',
            phone: data.phone || '',
            email: data.email || '',
            website: data.website || '',
            taxId: data.tax_id || '',
            registrationNumber: data.registration_number || '',
            defaultCurrency: data.default_currency || 'USD',
            defaultTerms: data.default_terms || 'Payment due within 30 days of receipt.',
            defaultNotes: data.default_notes || '',
            defaultPaymentInstructions: data.default_payment_instructions || ''
          });
          
          // Fetch logo if available
          if (data.logo_path) {
            const { data: logoData, error: logoError } = await supabase
              .storage
              .from('company-logos')
              .download(data.logo_path);
              
            if (!logoError && logoData) {
              const logoUrl = URL.createObjectURL(logoData);
              setLogoPreview(logoUrl);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching company profile:', err);
        setError('Failed to load company profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, supabase]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle logo upload
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
  
  // Remove logo
  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };
  
  // Save profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);
      
      // Upload logo if changed
      let logoPath = null;
      if (logo) {
        const fileName = `${user.id}/${Date.now()}-${logo.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('company-logos')
          .upload(fileName, logo, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          throw new Error('Failed to upload logo');
        }
        
        logoPath = fileName;
      }
      
      // Prepare data for save
      const profileData = {
        user_id: user.id,
        name: profile.name,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
        country: profile.country,
        phone: profile.phone,
        email: profile.email,
        website: profile.website,
        tax_id: profile.taxId,
        registration_number: profile.registrationNumber,
        default_currency: profile.defaultCurrency,
        default_terms: profile.defaultTerms,
        default_notes: profile.defaultNotes,
        default_payment_instructions: profile.defaultPaymentInstructions,
        updated_at: new Date().toISOString()
      };
      
      // Add logo path if available
      if (logoPath) {
        profileData.logo_path = logoPath;
      }
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('company_profiles')
          .update(profileData)
          .eq('user_id', user.id);
          
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new profile
        profileData.created_at = new Date().toISOString();
        
        const { error: insertError } = await supabase
          .from('company_profiles')
          .insert([profileData]);
          
        if (insertError) {
          throw insertError;
        }
      }
      
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error saving company profile:', err);
      setError('Failed to save company profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Company Profile</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        This information will appear on your reports and invoices.
      </p>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
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
                  value={profile.name}
                  onChange={handleInputChange}
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
                  value={profile.address}
                  onChange={handleInputChange}
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
                    value={profile.city}
                    onChange={handleInputChange}
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
                    value={profile.state}
                    onChange={handleInputChange}
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
                    value={profile.zip}
                    onChange={handleInputChange}
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
                    value={profile.country}
                    onChange={handleInputChange}
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
                    value={profile.phone}
                    onChange={handleInputChange}
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
                    value={profile.email}
                    onChange={handleInputChange}
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
                  value={profile.website}
                  onChange={handleInputChange}
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
                    value={profile.taxId}
                    onChange={handleInputChange}
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
                    value={profile.registrationNumber}
                    onChange={handleInputChange}
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
                    value={profile.defaultCurrency}
                    onChange={handleInputChange}
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
                    value={profile.defaultTerms}
                    onChange={handleInputChange}
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
                    value={profile.defaultPaymentInstructions}
                    onChange={handleInputChange}
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
                    value={profile.defaultNotes}
                    onChange={handleInputChange}
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
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Company Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
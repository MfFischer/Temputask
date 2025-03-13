import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Only allow POST/PATCH requests
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createPagesServerClient({ req, res });
    
    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Extract profile data from request body
    const {
      name,
      address,
      city,
      state,
      zip,
      country,
      phone,
      email,
      website,
      taxId,
      registrationNumber,
      defaultCurrency,
      defaultTerms,
      defaultNotes,
      defaultPaymentInstructions,
      logoPath // This might be passed from uploadLogo endpoint
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Prepare data for update
    const profileData = {
      name,
      address: address || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      country: country || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      tax_id: taxId || null,
      registration_number: registrationNumber || null,
      default_currency: defaultCurrency || 'USD',
      default_terms: defaultTerms || null,
      default_notes: defaultNotes || null,
      default_payment_instructions: defaultPaymentInstructions || null,
      updated_at: new Date().toISOString()
    };

    // Add logo path if provided
    if (logoPath) {
      profileData.logo_path = logoPath;
    }

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      return res.status(500).json({ error: 'Failed to check existing profile: ' + checkError.message });
    }

    let profile;
    let error;

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from('company_profiles')
        .update(profileData)
        .eq('user_id', session.user.id)
        .select()
        .single();
      
      profile = result.data;
      error = result.error;
    } else {
      // Create new profile
      profileData.user_id = session.user.id;
      profileData.created_at = new Date().toISOString();
      
      const result = await supabase
        .from('company_profiles')
        .insert([profileData])
        .select()
        .single();
      
      profile = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error saving company profile:', error);
      return res.status(500).json({ error: 'Failed to save company profile: ' + error.message });
    }

    // If we have a logo path, generate a signed URL
    if (profile && profile.logo_path) {
      try {
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('company-logos')
          .createSignedUrl(profile.logo_path, 60 * 60); // 1 hour expiry

        if (!signedUrlError && signedUrlData) {
          profile.logo_url = signedUrlData.signedUrl;
        }
      } catch (logoErr) {
        console.error('Error getting logo URL:', logoErr);
        // Don't fail the whole request if logo URL generation fails
      }
    }

    // Return the updated profile
    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
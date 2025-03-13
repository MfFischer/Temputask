import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parsing for this route, as we'll handle file uploads with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Parse form data (file upload)
    const form = new formidable.IncomingForm({
      keepExtensions: true, // Keep file extensions
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    const parseForm = () => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });
    };

    const { files } = await parseForm();
    const logoFile = files.logo; // Assuming 'logo' is the field name in the form

    if (!logoFile) {
      return res.status(400).json({ error: 'No logo file provided' });
    }

    // Check file type (allow only image files)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(logoFile.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and SVG files are allowed.' 
      });
    }

    // Read file content
    const fileContent = await fs.promises.readFile(logoFile.filepath);
    
    // Generate file path in storage
    const fileName = `${session.user.id}/${Date.now()}-${path.basename(logoFile.originalFilename || 'logo')}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('company-logos')
      .upload(fileName, fileContent, {
        contentType: logoFile.mimetype,
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return res.status(500).json({ error: 'Failed to upload logo: ' + uploadError.message });
    }

    // Update company profile with the new logo path
    const { data: profileData, error: profileError } = await supabase
      .from('company_profiles')
      .update({ 
        logo_path: fileName,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .select()
      .single();
    
    if (profileError) {
      // If updating fails, it might be because the profile doesn't exist yet
      // In that case, we'll create a minimal profile with just the logo path
      if (profileError.code === 'PGRST116') { // No rows updated
        const { data: newProfile, error: createError } = await supabase
          .from('company_profiles')
          .insert([{
            user_id: session.user.id,
            name: 'My Company', // Default name
            logo_path: fileName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating company profile with logo:', createError);
          return res.status(500).json({ error: 'Failed to create profile with logo: ' + createError.message });
        }
        
        return res.status(200).json({ 
          success: true, 
          logoPath: fileName,
          profile: newProfile
        });
      }
      
      console.error('Error updating company profile with logo:', profileError);
      return res.status(500).json({ error: 'Failed to update profile with logo: ' + profileError.message });
    }

    // Generate signed URL for the logo
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('company-logos')
      .createSignedUrl(fileName, 60 * 60); // 1 hour expiry
    
    // Return success with logo details
    return res.status(200).json({
      success: true,
      logoPath: fileName,
      logoUrl: urlError ? null : urlData.signedUrl,
      profile: profileData
    });
  } catch (error) {
    console.error('Error processing logo upload:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  } finally {
    // Clean up any temporary files
    if (req.files && req.files.logo) {
      try {
        fs.unlink(req.files.logo.filepath, () => {});
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}
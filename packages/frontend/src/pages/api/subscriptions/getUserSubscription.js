// /pages/api/subscriptions/getUserSubscription.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from cookies
    const token = req.cookies['sb-access-token'] || req.cookies['sb:token'];
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Set auth token if available
    let userId = null;
    if (token) {
      // Get user session
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session?.user) {
        userId = data.session.user.id;
      }
    }
    
    // If no user ID, return default trial info
    if (!userId) {
      return res.status(200).json({
        status: 'trialing',
        daysLeft: 30,
        plan: 'Trial',
        planId: null,
        nextBillingDate: null,
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Fetch subscription from database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      throw error;
    }

    // No subscription found, return default trial
    if (!subscription) {
      return res.status(200).json({
        status: 'trialing',
        daysLeft: 30,
        plan: 'Trial',
        planId: null,
        nextBillingDate: null,
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Calculate days left in trial
    const trialEnd = subscription.trial_end_date;
    const daysLeft = trialEnd 
      ? Math.max(0, Math.ceil((new Date(trialEnd) - new Date()) / (1000 * 60 * 60 * 24))) 
      : 0;
    
    return res.status(200).json({
      status: subscription.status || 'trialing',
      daysLeft,
      plan: subscription.plan || 'Trial',
      planId: subscription.plan_id,
      nextBillingDate: subscription.current_period_end,
      trialEndDate: subscription.trial_end_date
    });
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    
    // Return default trial info on error to prevent UI breaking
    return res.status(200).json({
      status: 'trialing',
      daysLeft: 30,
      plan: 'Trial',
      planId: null,
      nextBillingDate: null,
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }
}
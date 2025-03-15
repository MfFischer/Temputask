import { db } from '@shared/lib/db';  // Use the shared db import
import { getServerSession } from 'next-auth/next';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;
    
    // Use the Supabase client from the shared db module
    const { data, error } = await db.supabase
      .from('subscriptions')
      .select('trial_end_date')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error querying subscription:', error);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (!data) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const trialEnd = data.trial_end_date;
    const daysLeft = trialEnd ? Math.ceil((new Date(trialEnd) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
    
    res.status(200).json({ daysLeft, trialEnd });
  } catch (error) {
    console.error('Error fetching trial status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
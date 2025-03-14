import { db } from '@shared/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.cookies?.userId || req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // For testing, return mock data
    return res.status(200).json({
      status: 'trialing',
      daysLeft: 30,
      plan: null,
      nextBillingDate: null,
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
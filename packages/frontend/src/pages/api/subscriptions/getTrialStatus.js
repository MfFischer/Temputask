import { pool } from '../../../lib/db';
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
    
    const result = await pool.query(
      'SELECT trial_end_date FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const trialEnd = result.rows[0].trial_end_date;
    const daysLeft = trialEnd ? Math.ceil((new Date(trialEnd) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
    
    res.status(200).json({ daysLeft, trialEnd });
  } catch (error) {
    console.error('Error fetching trial status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
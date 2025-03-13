import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Stripe from 'stripe';
import { db } from '@shared/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createServerSupabaseClient({ req, res });
    
    // Get user session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userResult = await db.query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [session.user.id]
    );
    
    const customerId = userResult.rows[0]?.stripe_customer_id;
    
    if (!customerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin}/settings/billing`,
    });

    return res.status(200).json({
      url: portalSession.url
    });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
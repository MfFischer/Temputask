import Stripe from 'stripe';
import { pool } from '../../../lib/db';
import { getServerSession } from 'next-auth/next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const VALID_PLANS = {
  MONTHLY: process.env.STRIPE_MONTHLY_PRICE_ID,
  ANNUAL: process.env.STRIPE_ANNUAL_PRICE_ID
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use consistent auth method
    const session = await getServerSession(req, res);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    // Get user email from database
    const userEmailResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );
    
    const userEmail = userEmailResult.rows[0]?.email;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found' });
    }

    const { planId, successUrl, cancelUrl } = req.body;
    if (!planId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate planId against environment variables
    if (!Object.values(VALID_PLANS).includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Find or create Stripe customer
    const userResult = await pool.query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );
    
    let customerId = userResult.rows[0]?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      });
      
      customerId = customer.id;
      
      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, userId]
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: planId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId }
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
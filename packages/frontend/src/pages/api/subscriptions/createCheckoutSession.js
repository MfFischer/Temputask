import Stripe from 'stripe';
import { db } from '@shared/lib/db';
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

    // Get user email from database using Supabase
    const { data: userData, error: userError } = await db.supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single();
      
    if (userError) {
      throw userError;
    }
    
    const userEmail = userData.email;
    let customerId = userData.stripe_customer_id;

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

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      });
      
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db.supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session with trial period
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: planId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 30, // This sets a 30-day trial
      },
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
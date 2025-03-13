import Stripe from 'stripe';
import { buffer } from 'micro';
import { pool } from '../../../shared/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parsing for raw buffer access
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Get the webhook signature from Stripe
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  // Read the raw body
  const buf = await buffer(req);
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle different webhook events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        
        // Check if this is a new subscription checkout
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription;
          
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Update user's subscription in database
          await pool.query(
            `INSERT INTO subscriptions (
              user_id,
              stripe_subscription_id,
              status,
              plan_id,
              current_period_start,
              current_period_end,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (user_id) DO UPDATE SET
              stripe_subscription_id = $2,
              status = $3,
              plan_id = $4,
              current_period_start = $5,
              current_period_end = $6,
              updated_at = $7`,
            [
              userId,
              subscriptionId,
              subscription.status,
              subscription.items.data[0].price.id,
              new Date(subscription.current_period_start * 1000),
              new Date(subscription.current_period_end * 1000),
              new Date()
            ]
          );
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Find user by Stripe customer ID
        const userResult = await pool.query(
          'SELECT id FROM users WHERE stripe_customer_id = $1',
          [subscription.customer]
        );
        
        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          
          // Update subscription in database
          await pool.query(
            `UPDATE subscriptions SET
              status = $1,
              plan_id = $2,
              current_period_start = $3,
              current_period_end = $4,
              updated_at = $5
            WHERE user_id = $6`,
            [
              subscription.status,
              subscription.items.data[0].price.id,
              new Date(subscription.current_period_start * 1000),
              new Date(subscription.current_period_end * 1000),
              new Date(),
              userId
            ]
          );
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Find user by Stripe customer ID
        const userResult = await pool.query(
          'SELECT id FROM users WHERE stripe_customer_id = $1',
          [subscription.customer]
        );
        
        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          
          // Update subscription status to canceled
          await pool.query(
            `UPDATE subscriptions SET
              status = $1,
              updated_at = $2
            WHERE user_id = $3`,
            ['canceled', new Date(), userId]
          );
        }
        break;
      }

      default:
        // Ignore other events
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
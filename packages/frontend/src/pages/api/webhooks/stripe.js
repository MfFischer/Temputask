import Stripe from 'stripe';
import { buffer } from 'micro';
import { db } from '@shared/lib/db';

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
          
          // Get price details to determine plan name
          const priceId = subscription.items.data[0].price.id;
          const price = await stripe.prices.retrieve(priceId);
          const planName = price.nickname || (priceId === process.env.STRIPE_MONTHLY_PRICE_ID ? 'Monthly' : 'Annual');
          
          // Update user's subscription in database
          const { error } = await db.supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_subscription_id: subscriptionId,
              status: subscription.status,
              plan: planName, // Use the plan name for the 'plan' field
              plan_id: priceId, // Store the actual price ID
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_start_date: subscription.trial_start 
                ? new Date(subscription.trial_start * 1000).toISOString() 
                : null,
              trial_end_date: subscription.trial_end 
                ? new Date(subscription.trial_end * 1000).toISOString() 
                : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            
          if (error) {
            console.error('Error updating subscription:', error);
            throw error;
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Find user by Stripe customer ID
        const { data: users, error: userError } = await db.supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', subscription.customer);
          
        if (userError) {
          throw userError;
        }
        
        if (users && users.length > 0) {
          const userId = users[0].id;
          
          // Get price details to determine plan name
          const priceId = subscription.items.data[0].price.id;
          const price = await stripe.prices.retrieve(priceId);
          const planName = price.nickname || (priceId === process.env.STRIPE_MONTHLY_PRICE_ID ? 'Monthly' : 'Annual');
          
          // Update subscription in database
          const { error } = await db.supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              plan: planName,
              plan_id: priceId,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_start_date: subscription.trial_start 
                ? new Date(subscription.trial_start * 1000).toISOString() 
                : null,
              trial_end_date: subscription.trial_end 
                ? new Date(subscription.trial_end * 1000).toISOString() 
                : null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (error) {
            console.error('Error updating subscription:', error);
            throw error;
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Find user by Stripe customer ID
        const { data: users, error: userError } = await db.supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', subscription.customer);
          
        if (userError) {
          throw userError;
        }
        
        if (users && users.length > 0) {
          const userId = users[0].id;
          
          // Update subscription status to canceled
          const { error } = await db.supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (error) {
            console.error('Error updating subscription:', error);
            throw error;
          }
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
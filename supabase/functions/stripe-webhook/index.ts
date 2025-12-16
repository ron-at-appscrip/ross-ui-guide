import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SK_DEV');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('Missing Stripe signature');
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log(`Received webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session, supabase);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent, supabase);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent, supabase);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  try {
    const { renewalId, serialNumber } = session.metadata || {};
    
    if (!renewalId || !serialNumber) {
      console.warn('Missing metadata in checkout session:', session.id);
      return;
    }

    // Store payment record
    const { error: paymentError } = await supabase
      .from('trademark_renewal_payments')
      .insert({
        renewal_id: renewalId,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error('Error storing payment record:', paymentError);
      return;
    }

    // Update renewal status
    const { error: renewalError } = await supabase
      .from('trademark_renewals')
      .update({
        status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', renewalId);

    if (renewalError) {
      console.error('Error updating renewal status:', renewalError);
      return;
    }

    // TODO: Send confirmation email
    // TODO: Create USPTO filing task
    // TODO: Update client notification

    console.log(`Successfully processed payment for renewal: ${renewalId}`);

  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  try {
    const { renewalId } = paymentIntent.metadata || {};
    
    if (!renewalId) {
      console.warn('Missing renewal ID in payment intent:', paymentIntent.id);
      return;
    }

    // Update payment record with payment intent details
    const { error } = await supabase
      .from('trademark_renewal_payments')
      .update({
        stripe_payment_intent: paymentIntent.id,
        receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
        status: 'completed',
      })
      .eq('renewal_id', renewalId);

    if (error) {
      console.error('Error updating payment intent:', error);
      return;
    }

    console.log(`Payment intent succeeded for renewal: ${renewalId}`);

  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
  }
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  try {
    const { renewalId } = paymentIntent.metadata || {};
    
    if (!renewalId) {
      console.warn('Missing renewal ID in failed payment intent:', paymentIntent.id);
      return;
    }

    // Update payment record as failed
    const { error } = await supabase
      .from('trademark_renewal_payments')
      .update({
        stripe_payment_intent: paymentIntent.id,
        status: 'failed',
      })
      .eq('renewal_id', renewalId);

    if (error) {
      console.error('Error updating failed payment:', error);
      return;
    }

    // Update renewal status back to payment_pending
    const { error: renewalError } = await supabase
      .from('trademark_renewals')
      .update({
        status: 'payment_pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', renewalId);

    if (renewalError) {
      console.error('Error updating renewal status after payment failure:', renewalError);
    }

    console.log(`Payment failed for renewal: ${renewalId}`);

  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error);
  }
}
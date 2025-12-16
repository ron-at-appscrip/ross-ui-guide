import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutSessionRequest {
  renewalId: string;
  serialNumber: string;
  userEmail: string;
  items: LineItem[];
  successUrl: string;
  cancelUrl: string;
}

interface LineItem {
  name: string;
  description: string;
  amount: number; // in cents
  quantity: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SK_DEV');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not found');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Parse request body
    const body: CheckoutSessionRequest = await req.json();
    const { renewalId, serialNumber, userEmail, items, successUrl, cancelUrl } = body;

    // Validate required fields
    if (!renewalId || !serialNumber || !userEmail || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Convert line items to Stripe format
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: item.amount,
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        renewalId,
        serialNumber,
        source: 'trademark-renewal',
      },
      billing_address_collection: 'required',
      payment_intent_data: {
        description: `Trademark Renewal for Serial #${serialNumber}`,
        metadata: {
          renewalId,
          serialNumber,
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
    });

    // Log session creation (optional - for monitoring)
    console.log(`Checkout session created: ${session.id} for renewal: ${renewalId}`);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to create checkout session',
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
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RetrieveSessionRequest {
  sessionId: string;
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
    const body: RetrieveSessionRequest = await req.json();
    const { sessionId } = body;

    // Validate required fields
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    // Validate session exists and is paid
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { 
          status: 404, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Get payment intent for receipt URL
    let receiptUrl = null;
    if (session.payment_intent && typeof session.payment_intent === 'object') {
      receiptUrl = session.payment_intent.charges?.data?.[0]?.receipt_url || null;
    }

    // Extract relevant session data
    const sessionData = {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_details: session.customer_details,
      metadata: session.metadata,
      created: session.created,
      expires_at: session.expires_at,
      receipt_url: receiptUrl,
      line_items: session.line_items?.data?.map(item => ({
        description: item.description,
        amount_total: item.amount_total,
        currency: item.currency,
        quantity: item.quantity,
      })) || [],
    };

    // Log successful retrieval (optional - for monitoring)
    console.log(`Session retrieved: ${session.id}, status: ${session.payment_status}`);

    return new Response(
      JSON.stringify(sessionData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    
    let errorMessage = 'Failed to retrieve checkout session';
    let statusCode = 500;

    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No such checkout session')) {
        errorMessage = 'Checkout session not found';
        statusCode = 404;
      } else if (error.message.includes('Invalid session')) {
        errorMessage = 'Invalid session ID';
        statusCode = 400;
      }
    }
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
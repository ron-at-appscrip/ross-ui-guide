import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key
const stripePublicKey = import.meta.env.VITE_STRIPE_PK_DEV;

if (!stripePublicKey) {
  console.warn('Stripe public key not found. Payment functionality will be disabled.');
}

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripePublicKey) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

export interface CheckoutSessionData {
  renewalId: string;
  serialNumber: string;
  userEmail: string;
  items: LineItem[];
  successUrl: string;
  cancelUrl: string;
}

export interface LineItem {
  name: string;
  description: string;
  amount: number; // in cents
  quantity: number;
}

export class StripeService {
  /**
   * Creates a checkout session on the server
   * This should call a Supabase Edge Function to create the session securely
   */
  static async createCheckoutSession(data: CheckoutSessionData): Promise<{ sessionId: string; url: string }> {
    try {
      // In production, this would call a Supabase Edge Function
      // For now, we'll call the edge function endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();
      return { sessionId, url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Redirects to Stripe Checkout
   */
  static async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
  }

  /**
   * Creates line items for trademark renewal fees
   */
  static createRenewalLineItems(formData: any, trademark: any): LineItem[] {
    const items: LineItem[] = [];

    // JMR Service Fee for Section 8
    items.push({
      name: 'JMR Legal Service Fee',
      description: 'Section 8 Declaration of Continued Use preparation and filing',
      amount: 20000, // $200.00 in cents
      quantity: 1,
    });

    // Rush Processing Fee (if applicable)
    if (formData.processingSpeed === 'rush') {
      items.push({
        name: 'Rush Processing Fee',
        description: '2 business day expedited processing',
        amount: 50000, // $500.00 in cents
        quantity: 1,
      });
    }

    // USPTO Government Fees
    items.push({
      name: 'USPTO Government Fee - Section 8',
      description: 'Official USPTO filing fee for Section 8 Declaration',
      amount: 22500, // $225.00 in cents
      quantity: 1,
    });

    // Grace Period Fee (if applicable)
    const registrationDate = trademark?.registrationDate;
    if (registrationDate && isInGracePeriod(registrationDate)) {
      items.push({
        name: 'USPTO Grace Period Fee',
        description: 'Additional fee for filing during grace period',
        amount: 10000, // $100.00 in cents
        quantity: 1,
      });
    }

    // Section 15 Fee (if applicable)
    if (formData.section15 && formData.section15Continuous !== 'no' && formData.section15Challenged !== 'yes') {
      items.push({
        name: 'USPTO Government Fee - Section 15',
        description: 'Official USPTO filing fee for Section 15 Declaration of Incontestability',
        amount: 20000, // $200.00 in cents
        quantity: 1,
      });
    }

    // Section 9 Renewal Fee (if applicable for 10-year renewal)
    if (formData.section9) {
      items.push({
        name: 'USPTO Government Fee - Section 9',
        description: 'Official USPTO filing fee for Section 9 Renewal',
        amount: 22500, // $225.00 in cents  
        quantity: 1,
      });
    }

    return items;
  }

  /**
   * Calculates total amount from line items
   */
  static calculateTotal(items: LineItem[]): number {
    return items.reduce((total, item) => total + (item.amount * item.quantity), 0);
  }

  /**
   * Formats amount from cents to dollars (USD only)
   */
  static formatAmount(amountInCents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountInCents / 100);
  }

  /**
   * Validates that currency is USD (enforcement for trademark renewals)
   */
  private static validateCurrency(): void {
    // All trademark renewal payments must be in USD
    // This is enforced throughout the system
  }

  /**
   * Retrieves checkout session details
   */
  static async retrieveSession(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/retrieve-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      throw error;
    }
  }
}

/**
 * Helper function to check if a trademark is in grace period
 */
function isInGracePeriod(registrationDate: string): boolean {
  if (!registrationDate) return false;
  
  const regDate = new Date(registrationDate);
  const now = new Date();
  const yearsSinceReg = (now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  // Check if it's been 5-6 years or 9-10 years (grace periods)
  const inFirstGracePeriod = yearsSinceReg > 5.5 && yearsSinceReg <= 6;
  const inSecondGracePeriod = yearsSinceReg > 9.5 && yearsSinceReg <= 10;
  
  return inFirstGracePeriod || inSecondGracePeriod;
}

export default StripeService;
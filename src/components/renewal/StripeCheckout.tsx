import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Loader2, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { StripeService, LineItem } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';

interface StripeCheckoutProps {
  renewalId: string;
  serialNumber: string;
  userEmail: string;
  formData: any;
  trademark: any;
  signature: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export default function StripeCheckout({
  renewalId,
  serialNumber,
  userEmail,
  formData,
  trademark,
  signature,
  onSuccess,
  disabled = false
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate line items based on form data
  const lineItems = StripeService.createRenewalLineItems(formData, trademark);
  const totalAmount = StripeService.calculateTotal(lineItems);

  const handleCheckout = async () => {
    if (!signature) {
      toast({
        title: "Signature required",
        description: "Please provide your electronic signature before proceeding to payment",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create success and cancel URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/trademark/renewal/success?session_id={CHECKOUT_SESSION_ID}&renewal_id=${renewalId}`;
      const cancelUrl = `${baseUrl}/trademark/renewal/cancel?renewal_id=${renewalId}`;

      // Create checkout session via Edge Function
      const { sessionId, url } = await StripeService.createCheckoutSession({
        renewalId,
        serialNumber,
        userEmail,
        items: lineItems,
        successUrl,
        cancelUrl
      });

      // Store form data in localStorage for recovery if needed
      localStorage.setItem(`renewal_${renewalId}`, JSON.stringify({
        formData,
        trademark,
        signature,
        createdAt: new Date().toISOString()
      }));

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        await StripeService.redirectToCheckout(sessionId);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      let errorMessage = "Failed to initialize payment. Please try again.";
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Stripe configuration missing')) {
          errorMessage = "Payment system is being configured. Please try again in a few minutes.";
        } else if (error.message.includes('Failed to create checkout session')) {
          errorMessage = "Unable to create payment session. Please check your connection and try again.";
        }
      }
      
      toast({
        title: "Payment error",
        description: errorMessage,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fee Breakdown */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Fee Breakdown
        </h3>
        
        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <p className="font-medium ml-4">
                {StripeService.formatAmount(item.amount * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total Amount Due (USD)</span>
          <span className="text-2xl text-green-600">{StripeService.formatAmount(totalAmount)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          * All payments processed in US Dollars (USD) only
        </p>
      </Card>

      {/* Payment Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Secure Payment Processing</strong>
          <p className="mt-1">
            Your payment will be processed securely through Stripe. We never store your credit card information.
            You will be redirected to Stripe's secure checkout page to complete your payment.
          </p>
        </AlertDescription>
      </Alert>

      {/* Payment Button */}
      <Button
        onClick={handleCheckout}
        disabled={disabled || loading || !signature}
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Redirecting to secure payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Proceed to Secure Payment
          </>
        )}
      </Button>

      {!signature && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please provide your electronic signature above before proceeding to payment.
          </AlertDescription>
        </Alert>
      )}

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          <span>PCI Compliant</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>Powered by Stripe</span>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Home, 
  Receipt, 
  Clock,
  FileCheck,
  Loader2
} from 'lucide-react';
import { StripeService } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';
import { downloadConfirmation, printConfirmation, ConfirmationData } from '@/utils/confirmationGenerator';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

interface PaymentDetails {
  sessionId: string;
  amountTotal: number;
  currency: string;
  customerEmail: string;
  paymentStatus: string;
  receiptUrl?: string;
}

interface RenewalDetails {
  renewalId: string;
  serialNumber: string;
  confirmationNumber: string;
}

export default function TrademarkRenewalSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [renewalDetails, setRenewalDetails] = useState<RenewalDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);

  const sessionId = searchParams.get('session_id');
  const renewalId = searchParams.get('renewal_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        // Retrieve session details from Stripe
        const session = await StripeService.retrieveSession(sessionId);
        
        setPaymentDetails({
          sessionId: session.id,
          amountTotal: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email || '',
          paymentStatus: session.payment_status,
          receiptUrl: session.receipt_url
        });

        // Store line items for confirmation generation
        setLineItems(session.line_items || []);

        // Generate confirmation number
        const confirmationNumber = `TMR-${Date.now().toString().slice(-8)}`;
        
        setRenewalDetails({
          renewalId: renewalId || '',
          serialNumber: searchParams.get('serial_number') || 'Unknown',
          confirmationNumber
        });

        // Clear stored form data
        if (renewalId) {
          localStorage.removeItem(`renewal_${renewalId}`);
        }

        toast({
          title: "Payment successful!",
          description: "Your trademark renewal has been submitted successfully.",
        });

      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('Failed to verify payment. Please contact support if this issue persists.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, renewalId, searchParams, toast]);

  const handleDownloadConfirmation = () => {
    if (!paymentDetails || !renewalDetails) return;

    const confirmationData: ConfirmationData = {
      confirmationNumber: renewalDetails.confirmationNumber,
      serialNumber: renewalDetails.serialNumber,
      paymentAmount: paymentDetails.amountTotal,
      paymentDate: new Date().toISOString(),
      userEmail: paymentDetails.customerEmail,
      lineItems: lineItems.map(item => ({
        name: item.description || 'Service',
        description: item.description || '',
        amount: item.amount_total || 0,
      }))
    };

    downloadConfirmation(confirmationData);
    
    toast({
      title: "Download started",
      description: "Your confirmation document is being downloaded",
    });
  };

  const handlePrintConfirmation = () => {
    if (!paymentDetails || !renewalDetails) return;

    const confirmationData: ConfirmationData = {
      confirmationNumber: renewalDetails.confirmationNumber,
      serialNumber: renewalDetails.serialNumber,
      paymentAmount: paymentDetails.amountTotal,
      paymentDate: new Date().toISOString(),
      userEmail: paymentDetails.customerEmail,
      lineItems: lineItems.map(item => ({
        name: item.description || 'Service',
        description: item.description || '',
        amount: item.amount_total || 0,
      }))
    };

    printConfirmation(confirmationData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                  <p className="text-lg">Verifying your payment...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-16">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="text-center mt-6">
                  <Button onClick={() => navigate('/')}>
                    <Home className="h-4 w-4 mr-2" />
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Success Header */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-lg text-green-700 dark:text-green-300">
                  Your trademark renewal has been submitted to the USPTO
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Confirmation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renewalDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmation Number</p>
                    <p className="font-mono text-lg font-semibold">{renewalDetails.confirmationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    <p className="font-mono text-lg">{renewalDetails.serialNumber}</p>
                  </div>
                </div>
              )}
              
              <Separator />

              {paymentDetails && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Payment Status</span>
                    <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                      {paymentDetails.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Amount Paid</span>
                    <span className="font-semibold">
                      {StripeService.formatAmount(paymentDetails.amountTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Payment Method</span>
                    <span>Credit Card</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Document Preparation</p>
                    <p className="text-sm text-muted-foreground">
                      Our legal team will prepare your Section 8 Declaration and any additional documents within 2 business days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">USPTO Filing</p>
                    <p className="text-sm text-muted-foreground">
                      We will file your renewal documents with the USPTO and provide you with the filing receipt.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Confirmation & Updates</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive email updates on the status of your renewal and final confirmation when complete.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {paymentDetails?.receiptUrl && (
              <Button variant="outline" asChild>
                <a href={paymentDetails.receiptUrl} target="_blank" rel="noopener noreferrer">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Receipt
                </a>
              </Button>
            )}
            
            <Button variant="outline" onClick={handleDownloadConfirmation}>
              <Download className="h-4 w-4 mr-2" />
              Download Confirmation
            </Button>

            <Button variant="outline" onClick={handlePrintConfirmation}>
              <FileCheck className="h-4 w-4 mr-2" />
              Print Confirmation
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                const subject = `Trademark Renewal Confirmation - ${renewalDetails?.confirmationNumber}`;
                const body = `Please find attached your trademark renewal confirmation.\n\nConfirmation Number: ${renewalDetails?.confirmationNumber}\nSerial Number: ${renewalDetails?.serialNumber}\nAmount Paid: ${StripeService.formatAmount(paymentDetails?.amountTotal || 0)}`;
                window.location.href = `mailto:${paymentDetails?.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Confirmation
            </Button>
            
            <Button onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>

          {/* Support Notice */}
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Need Help?</strong> If you have any questions about your renewal, please contact us at 
              <a href="mailto:support@jmrlegal.com" className="text-blue-600 hover:underline ml-1">
                support@jmrlegal.com
              </a> or reference confirmation number <strong>{renewalDetails?.confirmationNumber}</strong>.
            </AlertDescription>
          </Alert>
        </div>
      </main>
      <Footer />
    </div>
  );
}
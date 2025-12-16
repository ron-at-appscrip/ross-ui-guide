import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  XCircle, 
  ArrowLeft, 
  Home, 
  CreditCard,
  Phone,
  Mail,
  RefreshCw
} from 'lucide-react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

interface SavedRenewalData {
  formData: any;
  trademark: any;
  signature: string;
  createdAt: string;
}

export default function TrademarkRenewalCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [savedData, setSavedData] = useState<SavedRenewalData | null>(null);
  const renewalId = searchParams.get('renewal_id');

  useEffect(() => {
    // Try to retrieve saved form data
    if (renewalId) {
      const saved = localStorage.getItem(`renewal_${renewalId}`);
      if (saved) {
        try {
          setSavedData(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing saved data:', error);
        }
      }
    }
  }, [renewalId]);

  const handleRetryPayment = () => {
    if (renewalId && savedData) {
      // Navigate back to the renewal form with saved data
      navigate(`/trademark/renewal/${savedData.trademark?.serialNumber || ''}`, {
        state: {
          trademark: savedData.trademark,
          formData: savedData.formData,
          currentStep: 11 // Go directly to payment step
        }
      });
    } else {
      // Navigate back to renewal form
      navigate('/trademark/search');
    }
  };

  const handleStartOver = () => {
    // Clear saved data and start fresh
    if (renewalId) {
      localStorage.removeItem(`renewal_${renewalId}`);
    }
    navigate('/trademark/search');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Cancel Header */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-orange-600" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                  Payment Cancelled
                </h1>
                <p className="text-lg text-orange-700 dark:text-orange-300">
                  Your payment was cancelled and no charges were made
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Data is Safe */}
          {savedData && (
            <Card>
              <CardHeader>
                <CardTitle>Your Information is Safe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Don't worry! We've saved your renewal information. You can complete your payment anytime 
                  within the next 24 hours without having to re-enter all your details.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Trademark Serial Number</p>
                    <p className="font-mono">{savedData.trademark?.serialNumber || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Saved At</p>
                    <p>{new Date(savedData.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What would you like to do? */}
          <Card>
            <CardHeader>
              <CardTitle>What would you like to do?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleRetryPayment}
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-semibold">Complete Payment</p>
                    <p className="text-sm opacity-90">
                      {savedData ? 'Return to payment with your saved information' : 'Continue with your renewal'}
                    </p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline"
                onClick={handleStartOver}
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-semibold">Start Over</p>
                    <p className="text-sm text-muted-foreground">
                      Begin a new trademark renewal from the search page
                    </p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3">
                  <Home className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-semibold">Return to Dashboard</p>
                    <p className="text-sm text-muted-foreground">
                      Go back to your main dashboard
                    </p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Common Reasons for Payment Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Common Payment Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Card Declined?</p>
                  <p className="text-muted-foreground">
                    Check that your card has sufficient funds and that online purchases are enabled. 
                    Contact your bank if issues persist.
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium">Prefer Alternative Payment?</p>
                  <p className="text-muted-foreground">
                    We currently accept credit and debit cards. For wire transfers or other payment methods, 
                    please contact our support team.
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium">Technical Issues?</p>
                  <p className="text-muted-foreground">
                    Try refreshing your browser, clearing your cache, or using a different browser. 
                    Disable browser extensions if they might be interfering.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Need Help? */}
          <Alert>
            <Phone className="h-4 w-4" />
            <AlertDescription>
              <strong>Need Help?</strong> If you're experiencing payment issues, our support team is here to help.
              <div className="mt-2 space-y-1">
                <div>
                  <strong>Email:</strong> 
                  <a href="mailto:support@jmrlegal.com" className="text-blue-600 hover:underline ml-1">
                    support@jmrlegal.com
                  </a>
                </div>
                <div>
                  <strong>Phone:</strong> 
                  <a href="tel:+1234567890" className="text-blue-600 hover:underline ml-1">
                    (123) 456-7890
                  </a>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Return Button */}
          <div className="text-center pt-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
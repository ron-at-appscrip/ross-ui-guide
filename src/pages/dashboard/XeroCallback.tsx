import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { XeroService } from '@/services/xeroService';
import { useToast } from '@/components/ui/use-toast';

const XeroCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        throw new Error(errorDescription || error);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for tokens
      await XeroService.exchangeCodeForTokens(code, state || undefined);

      // Get tenants
      const tenants = await XeroService.getTenants();
      
      // If only one tenant, auto-select it
      if (tenants.length === 1) {
        XeroService.setTenant(tenants[0].tenantId);
      }

      setStatus('success');
      
      toast({
        title: "Connected to Xero",
        description: "Successfully connected your Xero account",
      });

      // Redirect back to billing after a short delay
      setTimeout(() => {
        navigate('/dashboard/billing?tab=integrations');
      }, 2000);
    } catch (error) {
      console.error('Xero callback error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to connect to Xero');
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect to Xero',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            {status === 'processing' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h2 className="text-xl font-semibold">Connecting to Xero</h2>
                <p className="text-muted-foreground">
                  Please wait while we complete the connection...
                </p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h2 className="text-xl font-semibold">Successfully Connected</h2>
                <p className="text-muted-foreground">
                  Your Xero account has been connected. Redirecting...
                </p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold">Connection Failed</h2>
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
                <button
                  onClick={() => navigate('/dashboard/billing?tab=integrations')}
                  className="text-primary hover:underline"
                >
                  Return to Billing
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default XeroCallback;
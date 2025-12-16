import React from 'react';
import ClientDetail from './ClientDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Error boundary component to catch runtime errors
class ClientDetailErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ClientDetail Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ClientDetailError error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ClientDetailError = ({ error }: { error: Error | null }) => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Client Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            There was an error loading the client details page. This might be due to:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Invalid client ID</li>
            <li>Missing or corrupted client data</li>
            <li>A component rendering error</li>
          </ul>
          
          {error && (
            <div className="p-3 bg-destructive/10 rounded-md">
              <p className="text-sm font-mono text-destructive">
                {error.message}
              </p>
              {process.env.NODE_ENV === 'development' && error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={() => navigate('/dashboard/clients')}>
              Back to Clients
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ClientDetailWrapper = () => {
  return (
    <ClientDetailErrorBoundary>
      <ClientDetail />
    </ClientDetailErrorBoundary>
  );
};

export default ClientDetailWrapper;
import React from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TestAuth = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Auth Context:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({ user, isLoading }, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Simple Auth:</h3>
            <p className="text-muted-foreground">No Supabase authentication - using simple localStorage-based auth</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button onClick={() => navigate('/dashboard/uspto')} variant="secondary">
              Go to USPTO Research
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAuth;
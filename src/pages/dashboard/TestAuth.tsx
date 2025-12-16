import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/WorkingAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TestAuth = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setSessionInfo(session);

        // Get profile if session exists
        if (session?.user?.id) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) throw profileError;
          setProfileInfo(profile);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    checkSession();
  }, []);

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
            <h3 className="font-semibold mb-2">Supabase Session:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Profile Data:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(profileInfo, null, 2)}
            </pre>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

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
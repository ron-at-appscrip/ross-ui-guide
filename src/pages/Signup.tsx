
import React, { useState } from 'react';
import SignupHeader from '@/components/auth/SignupHeader';
import SignupCard from '@/components/auth/SignupCard';
import SignupForm from '@/components/auth/SignupForm';

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <SignupHeader />
        <SignupCard>
          <SignupForm
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            socialLoading={socialLoading}
            setSocialLoading={setSocialLoading}
          />
        </SignupCard>
      </div>
    </div>
  );
};

export default Signup;

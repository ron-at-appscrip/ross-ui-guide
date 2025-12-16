
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignupCardProps {
  children: React.ReactNode;
}

const SignupCard: React.FC<SignupCardProps> = ({ children }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 pb-4 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">Create account</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default SignupCard;

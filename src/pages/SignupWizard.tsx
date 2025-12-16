
import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import SignupWizard from '@/components/wizard/SignupWizard';

const SignupWizardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-start mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-lg sm:text-xl font-bold">
            <BrainCircuit className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span>ROSS.AI</span>
          </Link>
        </div>
        <SignupWizard />
      </div>
    </div>
  );
};

export default SignupWizardPage;

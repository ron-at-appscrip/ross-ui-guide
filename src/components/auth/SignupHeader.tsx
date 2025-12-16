
import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

const SignupHeader = () => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <Link to="/" className="inline-flex items-center space-x-2 text-xl sm:text-2xl font-bold">
        <BrainCircuit className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <span>ROSS.AI</span>
      </Link>
      <p className="text-sm sm:text-base text-muted-foreground mt-2">Join the future of AI technology</p>
    </div>
  );
};

export default SignupHeader;

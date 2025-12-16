
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SignupFlowData {
  // From signup form or social login
  name?: string;
  email?: string;
  provider?: 'email' | 'google' | 'apple';
  
  // Additional data that might be available
  firstName?: string;
  lastName?: string;
  avatar?: string;
  
  // Track if this is a fresh signup
  isNewUser?: boolean;
}

interface SignupFlowContextType {
  signupData: SignupFlowData | null;
  setSignupData: (data: SignupFlowData) => void;
  clearSignupData: () => void;
  isFromSignup: boolean;
}

const SignupFlowContext = createContext<SignupFlowContextType | undefined>(undefined);

export const useSignupFlow = () => {
  const context = useContext(SignupFlowContext);
  if (context === undefined) {
    throw new Error('useSignupFlow must be used within a SignupFlowProvider');
  }
  return context;
};

interface SignupFlowProviderProps {
  children: ReactNode;
}

export const SignupFlowProvider: React.FC<SignupFlowProviderProps> = ({ children }) => {
  const [signupData, setSignupDataState] = useState<SignupFlowData | null>(null);

  const setSignupData = (data: SignupFlowData) => {
    const signupDataWithFlag = { ...data, isNewUser: true };
    setSignupDataState(signupDataWithFlag);
    // Store in sessionStorage for persistence across page reloads
    sessionStorage.setItem('signup-flow-data', JSON.stringify(signupDataWithFlag));
  };

  const clearSignupData = () => {
    setSignupDataState(null);
    sessionStorage.removeItem('signup-flow-data');
  };

  // Check if we have fresh signup data
  const isFromSignup = Boolean(
    signupData?.isNewUser || 
    (function() {
      try {
        const storedData = sessionStorage.getItem('signup-flow-data');
        return storedData && JSON.parse(storedData)?.isNewUser;
      } catch {
        return false;
      }
    })()
  );

  // Initialize from sessionStorage on mount
  React.useEffect(() => {
    const storedData = sessionStorage.getItem('signup-flow-data');
    if (storedData && !signupData) {
      try {
        const parsedData = JSON.parse(storedData);
        setSignupDataState(parsedData);
      } catch (error) {
        console.error('Failed to parse signup flow data:', error);
        sessionStorage.removeItem('signup-flow-data');
      }
    }
  }, [signupData]);

  const value: SignupFlowContextType = {
    signupData,
    setSignupData,
    clearSignupData,
    isFromSignup,
  };

  return (
    <SignupFlowContext.Provider value={value}>
      {children}
    </SignupFlowContext.Provider>
  );
};

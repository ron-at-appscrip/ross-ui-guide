import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/dashboard/AppSidebar';
import Header from '@/components/dashboard/Header';
import USPTO from './USPTO';

// Direct USPTO page that bypasses the normal dashboard layout
const USPTODirect = () => {
  // Mock user for header
  const mockUser = {
    id: '1',
    email: 'shivansh.mudgil@gmail.com',
    name: 'Shivansh',
    hasCompletedWizard: true
  };

  // Temporarily provide a mock auth context
  const mockAuthValue = {
    user: mockUser,
    isLoading: false,
    login: async () => {},
    register: async () => ({ shouldRedirectToWizard: false }),
    logout: async () => {},
    forgotPassword: async () => {},
    loginWithGoogle: async () => {},
    registerWithGoogle: async () => {}
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
              <USPTO />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default USPTODirect;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";
import { SignupFlowProvider } from "@/contexts/SignupFlowContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { initPerformanceMonitoring } from "@/utils/bundleAnalysis";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupWizardPage from "./pages/SignupWizard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Clients from "./pages/dashboard/Clients";
import AddClient from "./pages/dashboard/AddClient";
import ClientDetailWrapper from "./pages/dashboard/ClientDetailWrapper";
import Matters from "./pages/dashboard/Matters";
import MatterDetail from "./pages/dashboard/MatterDetail";
import Assistant from "./pages/dashboard/Assistant";
import Communications from "./pages/dashboard/Communications";
import Documents from "./pages/dashboard/Documents";
import Billing from "./pages/dashboard/Billing";
import Calendar from "./pages/dashboard/Calendar";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";
import NotificationSettings from "./pages/dashboard/NotificationSettings";
import BillingSettings from "./pages/dashboard/BillingSettings";
import AccountSettings from "./pages/dashboard/AccountSettings";
import SecuritySettings from "./pages/dashboard/SecuritySettings";
import Search from "./pages/dashboard/Search";
import Profile from "./pages/dashboard/Profile";
import ActivityLogs from "./pages/dashboard/ActivityLogs";
import Sessions from "./pages/dashboard/Sessions";
import TeamSessions from "./pages/dashboard/admin/TeamSessions";
import UserManagement from "./pages/dashboard/UserManagement";
import Teams from "./pages/dashboard/Teams";
import Roles from "./pages/dashboard/Roles";
import Integrations from "./pages/dashboard/Integrations";
import BillingTest from "./pages/dashboard/BillingTest";
import USPTO from "./pages/dashboard/USPTO";
import TestAuth from "./pages/dashboard/TestAuth";
import TestSimple from "./pages/TestSimple";
import USPTODirect from "./pages/dashboard/USPTODirect";
import XeroCallback from "./pages/dashboard/XeroCallback";
import { USPTOTest } from "./pages/dashboard/USPTOTest";
import USPTOServices from "./pages/USPTOServices";
import EUIPOServices from "./pages/EUIPOServices";
import EUIPOTrademarkDetail from "./pages/EUIPOTrademarkDetail";
import TrademarkDetail from "./pages/TrademarkDetail";
import TrademarkRenewal from "./pages/TrademarkRenewal";
import TrademarkRenewalSuccess from "./pages/TrademarkRenewalSuccess";
import TrademarkRenewalCancel from "./pages/TrademarkRenewalCancel";

const queryClient = new QueryClient();

// Initialize bundle performance monitoring
initPerformanceMonitoring();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SignupFlowProvider>
        <SimpleAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/uspto-services" element={<USPTOServices />} />
              <Route path="/euipo-services" element={<EUIPOServices />} />
              <Route path="/euipo/trademark/:applicationNumber" element={<EUIPOTrademarkDetail />} />
              {/* New routing with search type */}
              <Route path="/trademark/:searchType/:number" element={<TrademarkDetail />} />
              {/* Backward compatibility - old serial number only routing */}
              <Route path="/trademark/:serialNumber" element={<TrademarkDetail />} />
              <Route path="/trademark/:serialNumber/renewal" element={<TrademarkRenewal />} />
              <Route path="/trademark/renewal/success" element={<TrademarkRenewalSuccess />} />
              <Route path="/trademark/renewal/cancel" element={<TrademarkRenewalCancel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/test-simple" element={<TestSimple />} />
              <Route path="/uspto-direct" element={<USPTODirect />} />
              <Route path="/signup-wizard" element={<SignupWizardPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/xero/callback" element={<XeroCallback />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                } 
              >
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/new" element={<AddClient />} />
                <Route path="clients/:id" element={<ClientDetailWrapper />} />
                <Route path="matters" element={<Matters />} />
                <Route path="matters/:id" element={<MatterDetail />} />
                <Route path="assistant" element={<Assistant />} />
                <Route path="communications" element={<Communications />} />
                <Route path="documents" element={<Documents />} />
                <Route path="uspto" element={<USPTO />} />
                <Route path="uspto-test" element={<USPTOTest />} />
                <Route path="billing" element={<Billing />} />
                <Route path="billing-test" element={<BillingTest />} />
                <Route path="test-auth" element={<TestAuth />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="analytics/activity" element={<Analytics />} />
                <Route path="analytics/traffic" element={<Analytics />} />
                <Route path="analytics/statistics" element={<Analytics />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="teams" element={<Teams />} />
                <Route path="roles" element={<Roles />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="settings" element={<Settings />}>
                  <Route path="notifications" element={<NotificationSettings />} />
                  <Route path="billing" element={<BillingSettings />} />
                  <Route path="account" element={<AccountSettings />} />
                  <Route path="security" element={<SecuritySettings />} />
                </Route>
                <Route path="search" element={<Search />} />
                <Route path="profile" element={<Profile />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="admin/team-sessions" element={<TeamSessions />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SimpleAuthProvider>
      </SignupFlowProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

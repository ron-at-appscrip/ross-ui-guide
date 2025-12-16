
import React from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import TodaysPriorities from '@/components/dashboard/widgets/TodaysPriorities';
import ActiveMatters from '@/components/dashboard/widgets/ActiveMatters';
import RevenueInsights from '@/components/dashboard/widgets/RevenueInsights';
import PerformanceMetrics from '@/components/dashboard/widgets/PerformanceMetrics';
import AIInsightsFeed from '@/components/dashboard/widgets/AIInsightsFeed';
import RecentActivityTimeline from '@/components/dashboard/widgets/RecentActivityTimeline';
import QuickActions from '@/components/dashboard/widgets/QuickActions';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening in your legal practice today.
        </p>
      </div>

      {/* Quick Actions - Moved to top for better accessibility */}
      <QuickActions />

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column - Primary Widgets */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Row - Priorities and Matters */}
          <div className="grid gap-6 md:grid-cols-2">
            <TodaysPriorities />
            <ActiveMatters />
          </div>
          
          {/* Performance Metrics */}
          <PerformanceMetrics />
          
          {/* Revenue Insights - Full Width */}
          <RevenueInsights />
        </div>

        {/* Right Column - Secondary Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <AIInsightsFeed />
          <RecentActivityTimeline />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

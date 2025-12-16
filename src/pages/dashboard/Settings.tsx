
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const Settings = () => {
  const location = useLocation();
  
  // Show welcome message if on main settings route
  const isMainSettingsRoute = location.pathname === '/dashboard/settings';
  
  if (isMainSettingsRoute) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-heading-1 font-bold">Settings</h1>
            <p className="text-body text-muted-foreground">
              Manage your account preferences, notifications, billing, and security settings.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Use the Settings menu in the sidebar to navigate to specific settings.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <Outlet />
    </div>
  );
};

export default Settings;

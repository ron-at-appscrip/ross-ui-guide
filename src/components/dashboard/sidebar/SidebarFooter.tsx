
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { toast } from "sonner";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Settings, HelpCircle, LogOut, User } from "lucide-react";

const SidebarFooter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isActive = (href: string) => location.pathname === href || (href !== '/dashboard' && location.pathname.startsWith(href));

  const handleSignOut = async () => {
    console.log('Logout button clicked');
    
    try {
      await logout();
      console.log('Logout completed, navigating to home');
      navigate('/');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to sign out. Please try again.');
      
      // Force navigation even on error as a fallback
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      {/* Support & Settings */}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/dashboard/profile")}
            className="hover:bg-accent hover:text-accent-foreground text-form-label"
            tooltip="Profile"
          >
            <Link to="/dashboard/profile">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton className="hover:bg-accent hover:text-accent-foreground text-form-label" tooltip="Help Center">
            <HelpCircle className="h-4 w-4" />
            <span>Help Center</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={handleSignOut}
            className="hover:bg-accent hover:text-accent-foreground text-form-label text-destructive" 
            tooltip="Log Out"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
};

export default SidebarFooter;

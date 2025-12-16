
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useSidebar } from "@/components/ui/sidebar";

const SidebarHeader = () => {
  const { user } = useAuth();
  const { toggleSidebar } = useSidebar();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="p-4 border-b border-border bg-background">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-foreground">
                {user?.name || 'Legal Professional'}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.title || 'Attorney at Law'}
              </span>
            </div>
          </div>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 group-data-[collapsible=icon]:hidden"
          onClick={toggleSidebar}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;

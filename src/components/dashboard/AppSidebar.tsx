
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import SidebarHeaderComponent from "./sidebar/SidebarHeader";
import NavigationMenu from "./sidebar/NavigationMenu";
import SidebarFooterComponent from "./sidebar/SidebarFooter";

const AppSidebar = () => {
  return (
    <Sidebar className="bg-background border-r border-border">
      <SidebarHeader className="p-0">
        <SidebarHeaderComponent />
      </SidebarHeader>

      <SidebarContent className="px-2 bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <NavigationMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarFooterComponent />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

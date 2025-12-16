
import React from "react";
import { useLocation } from "react-router-dom";
import SafeLink from "@/components/SafeLink";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { navigationConfig, NavigationGroup } from "./navigationConfig";
import ErrorBoundary from "@/components/ErrorBoundary";

const NavigationMenu = () => {
  const location = useLocation();
  const isActive = (href: string) => location.pathname === href || (href !== '/dashboard' && location.pathname.startsWith(href));

  return (
    <ErrorBoundary>
      <SidebarMenu>
      {navigationConfig.main.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.href)}
            tooltip={item.label}
            className="hover:bg-accent hover:text-accent-foreground text-form-label"
          >
            <SafeLink to={item.href}>
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </SafeLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      
      {[navigationConfig.workspace, navigationConfig.administration, navigationConfig.firm, navigationConfig.settings].map((group) => {
        const isGroupActive = group.items.some(item => isActive(item.href));
        
        return (
          <SidebarMenuItem key={group.label}>
            <Collapsible defaultOpen={isGroupActive}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-between group hover:bg-accent hover:text-accent-foreground text-form-label" tooltip={group.label}>
                  <div className="flex items-center gap-2">
                    <group.icon className="h-4 w-4" />
                    <span>{group.label}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {group.items.map((item) => (
                    <SidebarMenuSubItem key={item.href}>
                      {item.submenu ? (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton className="w-full justify-between group hover:bg-accent hover:text-accent-foreground text-table-cell">
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </div>
                              <ChevronRight className="h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-4 space-y-1">
                              {item.submenu.map((subItem) => (
                                <SidebarMenuSubButton
                                  key={subItem.href}
                                  asChild
                                  isActive={isActive(subItem.href)}
                                  className="hover:bg-accent hover:text-accent-foreground text-table-cell text-xs"
                                >
                                  <SafeLink to={subItem.href}>
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.label}</span>
                                  </SafeLink>
                                </SidebarMenuSubButton>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive(item.href)}
                          className="hover:bg-accent hover:text-accent-foreground text-table-cell"
                        >
                          <SafeLink to={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </SafeLink>
                        </SidebarMenuSubButton>
                      )}
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        );
      })}
      </SidebarMenu>
    </ErrorBoundary>
  );
};

export default NavigationMenu;


import {
  Home,
  Users,
  Brain,
  Mail,
  FileText,
  Clock,
  Calendar,
  BarChart3,
  FolderOpen,
  Building2,
  Activity,
  TrendingUp,
  PieChart,
  ScrollText,
  Monitor,
  Shield,
  UserCog,
  Key,
  Plug,
  Settings,
  Bell,
  CreditCard,
  User,
  Search
} from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType;
  submenu?: NavigationItem[];
}

export interface NavigationGroup {
  label: string;
  icon: React.ComponentType;
  items: NavigationItem[];
}

export const navigationConfig = {
  main: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/assistant", label: "AI Assistant", icon: Brain },
  ],
  workspace: {
    label: "Workspace",
    icon: FolderOpen,
    items: [
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      { href: "/dashboard/matters", label: "Matters", icon: FileText },
      { href: "/dashboard/communications", label: "Communications", icon: Mail },
      { href: "/dashboard/documents", label: "Documents", icon: FileText },
      { href: "/dashboard/uspto", label: "USPTO Research", icon: Search },
      { href: "/dashboard/billing", label: "Time & Billing", icon: Clock },
      { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    ],
  } as NavigationGroup,
  administration: {
    label: "Administration",
    icon: Shield,
    items: [
      { href: "/dashboard/user-management", label: "User Management", icon: UserCog },
      { href: "/dashboard/teams", label: "Teams", icon: Users },
      { href: "/dashboard/roles", label: "Roles & Permissions", icon: Key },
      { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
    ],
  } as NavigationGroup,
  firm: {
    label: "Firm",
    icon: Building2,
    items: [
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, submenu: [
        { href: "/dashboard/analytics/activity", label: "Activity", icon: Activity },
        { href: "/dashboard/analytics/traffic", label: "Traffic", icon: TrendingUp },
        { href: "/dashboard/analytics/statistics", label: "Statistics", icon: PieChart },
      ]},
      { href: "/dashboard/activity-logs", label: "Activity Logs", icon: ScrollText },
    ],
  } as NavigationGroup,
  settings: {
    label: "Settings",
    icon: Settings,
    items: [
      { href: "/dashboard/settings/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/settings/security", label: "Security", icon: Shield },
    ],
  } as NavigationGroup,
};

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientsEmptyStateProps {
  searchTerm?: string;
  activeTab?: string;
}

const ClientsEmptyState = ({ searchTerm, activeTab }: ClientsEmptyStateProps) => {
  const navigate = useNavigate();

  const getEmptyMessage = () => {
    if (searchTerm) {
      return {
        icon: Search,
        title: "No clients found",
        description: `No clients match your search "${searchTerm}". Try adjusting your search terms.`,
        action: null
      };
    }

    if (activeTab && activeTab !== 'all') {
      const tabMessages = {
        active: "You don't have any active clients yet.",
        inactive: "You don't have any inactive clients.",
        company: "You don't have any company clients yet.",
        person: "You don't have any individual clients yet."
      };
      return {
        icon: Users,
        title: `No ${activeTab} clients`,
        description: tabMessages[activeTab as keyof typeof tabMessages] || "No clients found in this category.",
        action: null
      };
    }

    return {
      icon: Users,
      title: "No clients yet",
      description: "Start building your client base by adding your first client.",
      action: {
        label: "Add Your First Client",
        onClick: () => navigate('/dashboard/clients/new')
      }
    };
  };

  const { icon: Icon, title, description, action } = getEmptyMessage();

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-6">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick}>
            <UserPlus className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
        {!action && searchTerm && (
          <div className="flex flex-col items-center space-y-4">
            <Button variant="outline" onClick={() => navigate('/dashboard/clients/new')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
            <div className="text-sm text-muted-foreground">
              or try searching with different terms
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsEmptyState;
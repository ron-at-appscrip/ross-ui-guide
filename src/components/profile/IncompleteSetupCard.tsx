import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plug, 
  Shield, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface IncompleteSetupCardProps {
  type: 'team' | 'integrations' | 'compliance';
  firmSize: string;
}

const SETUP_CONFIG = {
  team: {
    icon: Users,
    title: 'Complete Team Setup',
    description: 'Invite team members and configure roles to collaborate effectively',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  integrations: {
    icon: Plug,
    title: 'Configure Integrations',
    description: 'Connect your favorite tools and services for seamless workflow',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  compliance: {
    icon: Shield,
    title: 'Set Up Compliance',
    description: 'Configure compliance requirements and security settings for your firm',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
};

const IncompleteSetupCard: React.FC<IncompleteSetupCardProps> = ({ type, firmSize }) => {
  const navigate = useNavigate();
  const config = SETUP_CONFIG[type];
  const Icon = config.icon;

  const handleComplete = () => {
    // Navigate to signup wizard with specific step
    navigate(`/signup-wizard?step=${type}`);
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-dashed">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${config.bgColor}`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{config.title}</h3>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-muted-foreground">
              {config.description}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button 
                onClick={handleComplete}
                variant="default"
                size="sm"
                className="gap-2"
              >
                Complete Setup
                <ArrowRight className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Optional step • 5-10 minutes
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncompleteSetupCard;
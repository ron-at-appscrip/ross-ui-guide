
import React from 'react';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CompletionStepProps {
  onComplete: () => void;
  userData: {
    name: string;
    firmName: string;
  };
  isLoading?: boolean;
}

const ONBOARDING_TASKS = [
  { id: 'profile', title: 'Complete your profile', completed: true },
  { id: 'team', title: 'Set up your team', completed: true },
  { id: 'first-case', title: 'Create your first case', completed: false },
  { id: 'integrations', title: 'Connect your tools', completed: false },
  { id: 'training', title: 'Complete ROSS.AI training', completed: false },
];

const CompletionStep: React.FC<CompletionStepProps> = ({ onComplete, userData, isLoading = false }) => {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold">Welcome to ROSS.AI, {userData.name}!</h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your account has been successfully created. You're all set to start using AI-powered legal research and case management.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Your Setup Summary</CardTitle>
          <CardDescription>Here's what we've configured for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account:</span>
            <span className="text-sm font-medium">{userData.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Firm:</span>
            <span className="text-sm font-medium">{userData.firmName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Next Steps</CardTitle>
          <CardDescription>Complete these tasks to get the most out of ROSS.AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ONBOARDING_TASKS.map((task) => (
            <div key={task.id} className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                task.completed 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {task.completed ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <div className="w-2 h-2 bg-current rounded-full" />
                )}
              </div>
              <span className={`text-sm ${
                task.completed ? 'text-green-600 line-through' : 'text-foreground'
              }`}>
                {task.title}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button onClick={onComplete} size="lg" className="px-8" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Setting up...' : 'Get Started'}
          {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
        <p className="text-sm text-muted-foreground">
          Ready to experience the future of legal work?
        </p>
      </div>
    </div>
  );
};

export default CompletionStep;

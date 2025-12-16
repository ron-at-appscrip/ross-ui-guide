
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Clock, TrendingUp, Plus, Settings, RefreshCw } from 'lucide-react';

const CommunicationsHeader = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-heading-1 font-bold text-foreground">Communications</h1>
          <p className="text-body text-muted-foreground max-w-2xl">
            Manage emails, meetings, and client communications with intelligent insights
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="hover-glass">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button variant="outline" size="sm" className="hover-glass">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover-glass transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50/80 rounded-xl group-hover:bg-blue-100/80 transition-colors">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary" className="text-xs font-medium">+3</Badge>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-form-label text-muted-foreground">Unread Messages</p>
              <p className="text-heading-3 font-bold text-foreground">12</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover-glass transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-50/80 rounded-xl group-hover:bg-green-100/80 transition-colors">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs font-medium text-green-600">Today</Badge>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-form-label text-muted-foreground">Meetings</p>
              <p className="text-heading-3 font-bold text-green-600">3</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover-glass transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-orange-50/80 rounded-xl group-hover:bg-orange-100/80 transition-colors">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-xs font-medium text-orange-600">Urgent</Badge>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-form-label text-muted-foreground">Pending Responses</p>
              <p className="text-heading-3 font-bold text-orange-600">8</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover-glass transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-50/80 rounded-xl group-hover:bg-purple-100/80 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="outline" className="text-xs font-medium text-purple-600">Excellent</Badge>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-form-label text-muted-foreground">Response Rate</p>
              <p className="text-heading-3 font-bold text-purple-600">92%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunicationsHeader;

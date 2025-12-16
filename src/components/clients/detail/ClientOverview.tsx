
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientOverviewProps {
  client: Client;
}

const ClientOverview = ({ client }: ClientOverviewProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Client Type</label>
              <p className="font-medium">{client.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="font-medium">{client.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Primary Contact</label>
              <p className="font-medium">{client.primaryContact}</p>
            </div>
            {client.industry && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Industry</label>
                <p className="font-medium">{client.industry}</p>
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Date Added</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(client.dateAdded).toLocaleDateString()}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(client.lastActivity).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.notes ? (
            <p className="text-sm leading-relaxed">{client.notes}</p>
          ) : (
            <p className="text-muted-foreground italic">No notes available</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-muted">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Matter "Contract Review" updated</span>
              </div>
              <span className="text-xs text-muted-foreground">2 days ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-muted">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Invoice #INV-2024-003 paid</span>
              </div>
              <span className="text-xs text-muted-foreground">5 days ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-muted">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Document "Partnership Agreement" uploaded</span>
              </div>
              <span className="text-xs text-muted-foreground">1 week ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOverview;

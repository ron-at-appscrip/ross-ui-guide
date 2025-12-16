
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Mail, Phone, Calendar, FileText, Clock } from 'lucide-react';

const mockTimeline = [
  {
    id: 1,
    type: 'email',
    title: 'Email sent to John Smith',
    description: 'Contract review reminder and next steps',
    timestamp: '2024-01-15 2:30 PM',
    matter: 'Johnson v. ABC Corp',
    participants: ['John Smith'],
    priority: 'high'
  },
  {
    id: 2,
    type: 'meeting',
    title: 'Client consultation completed',
    description: 'Discussed case strategy and timeline',
    timestamp: '2024-01-15 2:00 PM',
    matter: 'Johnson v. ABC Corp',
    participants: ['John Johnson', 'Legal Team'],
    priority: 'medium'
  },
  {
    id: 3,
    type: 'call',
    title: 'Phone call with opposing counsel',
    description: 'Settlement discussion and mediation scheduling',
    timestamp: '2024-01-15 11:00 AM',
    matter: 'Martinez Personal Injury',
    participants: ['Opposing Counsel'],
    priority: 'high'
  },
  {
    id: 4,
    type: 'email',
    title: 'Document request received',
    description: 'Discovery materials requested by opposing party',
    timestamp: '2024-01-14 4:15 PM',
    matter: 'Wilson Estate Planning',
    participants: ['Sarah Wilson'],
    priority: 'medium'
  },
  {
    id: 5,
    type: 'meeting',
    title: 'Deposition scheduled',
    description: 'Key witness deposition confirmed for next week',
    timestamp: '2024-01-14 10:30 AM',
    matter: 'Martinez Personal Injury',
    participants: ['Court Reporter', 'Witness'],
    priority: 'low'
  }
];

const CommunicationTimeline = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'call': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'document': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card glass>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle className="text-heading-3">Communication Timeline</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass border-glass w-64"
                />
              </div>
              <Button variant="outline" className="glass border-glass">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {mockTimeline.map((item, index) => (
          <Card key={item.id} glass className="hover-glass">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${getTypeColor(item.type)} bg-opacity-20`}>
                    {getTypeIcon(item.type)}
                  </div>
                  {index < mockTimeline.length - 1 && (
                    <div className="w-px h-12 bg-glass mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-form-label font-semibold">{item.title}</h3>
                      <p className="text-body text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(item.type)}`}>
                        {item.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.matter}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.participants.map((participant, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {participant}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="glass border-glass">
          Load More Communications
        </Button>
      </div>
    </div>
  );
};

export default CommunicationTimeline;

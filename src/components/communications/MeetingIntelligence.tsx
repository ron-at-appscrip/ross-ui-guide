
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, FileText, Video, Phone, MapPin } from 'lucide-react';

const mockMeetings = [
  {
    id: 1,
    title: 'Client Consultation - Johnson Case',
    type: 'video',
    date: '2024-01-15',
    time: '2:00 PM',
    duration: '1 hour',
    attendees: ['John Johnson', 'Sarah Attorney'],
    status: 'completed',
    summary: 'Discussed case strategy and next steps for the Johnson litigation.',
    actionItems: [
      'Prepare discovery requests',
      'Schedule deposition',
      'Review contracts'
    ],
    transcription: 'Available',
    matter: 'Johnson v. ABC Corp'
  },
  {
    id: 2,
    title: 'Team Strategy Meeting',
    type: 'in-person',
    date: '2024-01-16',
    time: '10:00 AM',
    duration: '2 hours',
    attendees: ['Legal Team', 'Partners'],
    status: 'upcoming',
    location: 'Conference Room A',
    matter: 'Multiple Cases Review'
  },
  {
    id: 3,
    title: 'Deposition - Martinez Case',
    type: 'phone',
    date: '2024-01-14',
    time: '9:00 AM',
    duration: '3 hours',
    attendees: ['Witness', 'Opposing Counsel', 'Court Reporter'],
    status: 'completed',
    summary: 'Key testimony obtained regarding the incident.',
    matter: 'Martinez Personal Injury'
  }
];

const MeetingIntelligence = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Meetings List */}
      <div className="lg:col-span-1 space-y-4">
        <Card glass>
          <CardHeader>
            <CardTitle className="text-heading-4">Recent Meetings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {mockMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 border-b border-glass ${
                    selectedMeeting === meeting.id ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => setSelectedMeeting(meeting.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-form-label font-medium">{meeting.title}</h4>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {meeting.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.time}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getTypeIcon(meeting.type)}
                        <span className="capitalize">{meeting.type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {meeting.attendees.length} attendees
                      </div>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      {meeting.matter}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Detail */}
      <div className="lg:col-span-2">
        {selectedMeeting ? (
          <div className="space-y-6">
            {(() => {
              const meeting = mockMeetings.find(m => m.id === selectedMeeting);
              return meeting ? (
                <>
                  <Card glass>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-heading-3">{meeting.title}</CardTitle>
                          <p className="text-body text-muted-foreground mt-1">
                            {meeting.date} at {meeting.time} ({meeting.duration})
                          </p>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-form-label font-medium mb-2">Meeting Type</h4>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(meeting.type)}
                            <span className="text-body capitalize">{meeting.type}</span>
                            {meeting.location && (
                              <span className="text-body text-muted-foreground">- {meeting.location}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-form-label font-medium mb-2">Attendees</h4>
                          <div className="flex flex-wrap gap-2">
                            {meeting.attendees.map((attendee, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {attendee}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-form-label font-medium mb-2">Matter</h4>
                        <Badge variant="outline">{meeting.matter}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {meeting.summary && (
                    <Card glass>
                      <CardHeader>
                        <CardTitle className="text-heading-4 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          AI Meeting Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-body">{meeting.summary}</p>
                      </CardContent>
                    </Card>
                  )}

                  {meeting.actionItems && (
                    <Card glass>
                      <CardHeader>
                        <CardTitle className="text-heading-4">Action Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {meeting.actionItems.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <span className="text-body">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {meeting.transcription && (
                    <Card glass>
                      <CardHeader>
                        <CardTitle className="text-heading-4">Transcription</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <p className="text-body text-muted-foreground">
                            Full meeting transcription is available
                          </p>
                          <Button variant="outline" size="sm" className="glass border-glass">
                            <FileText className="h-4 w-4 mr-2" />
                            View Transcript
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : null;
            })()}
          </div>
        ) : (
          <Card glass>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-body text-muted-foreground">
                  Select a meeting to view details and AI insights
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MeetingIntelligence;

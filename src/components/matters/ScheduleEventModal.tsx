import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, MapPin, Users, Bell, Plus, X } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Matter } from '@/types/matter';

interface ScheduleEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (eventData: EventData) => void;
  matter: Matter;
}

interface EventData {
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  attendees: string[];
  reminder: string;
  eventType: string;
  matterId: string;
  clientNotification: boolean;
}

const eventTypes = [
  'Client Meeting',
  'Court Hearing',
  'Deposition',
  'Consultation',
  'Team Meeting',
  'Deadline',
  'Filing Due',
  'Conference Call',
  'Site Visit',
  'Mediation',
  'Arbitration',
  'Other'
];

const reminderOptions = [
  { value: '0', label: 'No reminder' },
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
  { value: '60', label: '1 hour before' },
  { value: '120', label: '2 hours before' },
  { value: '1440', label: '1 day before' },
  { value: '2880', label: '2 days before' },
  { value: '10080', label: '1 week before' }
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({
  open,
  onClose,
  onSubmit,
  matter
}) => {
  const [formData, setFormData] = useState<EventData>({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '10:00',
    location: '',
    isVirtual: false,
    meetingLink: '',
    attendees: [],
    reminder: '30',
    eventType: '',
    matterId: matter.id,
    clientNotification: true
  });
  
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [newAttendee, setNewAttendee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.eventType) {
      newErrors.eventType = 'Event type is required';
    }

    // Validate time logic
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (formData.isVirtual && !formData.meetingLink?.trim()) {
      newErrors.meetingLink = 'Meeting link is required for virtual events';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '10:00',
        location: '',
        isVirtual: false,
        meetingLink: '',
        attendees: [],
        reminder: '30',
        eventType: '',
        matterId: matter.id,
        clientNotification: true
      });
      setStartDate(new Date());
      setEndDate(new Date());
      onClose();
    } catch (error) {
      console.error('Error scheduling event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof EventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addAttendee = () => {
    if (newAttendee.trim() && !formData.attendees.includes(newAttendee.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()]
      }));
      setNewAttendee('');
    }
  };

  const removeAttendee = (attendeeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(attendee => attendee !== attendeeToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAttendee();
    }
  };

  const autoSetEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date();
    startDateTime.setHours(hours, minutes);
    
    // Default to 1 hour meeting
    const endDateTime = addMinutes(startDateTime, 60);
    const endTime = format(endDateTime, 'HH:mm');
    
    setFormData(prev => ({ ...prev, endTime }));
  };

  const formatEventDateTime = () => {
    const startDateTime = `${format(startDate, 'PPP')} at ${formData.startTime}`;
    const endDateTime = `${format(endDate, 'PPP')} at ${formData.endTime}`;
    
    if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      return `${format(startDate, 'PPP')} from ${formData.startTime} to ${formData.endTime}`;
    }
    
    return `${startDateTime} to ${endDateTime}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Schedule Event</span>
          </DialogTitle>
          <DialogDescription>
            Schedule an event for {matter.title} - {matter.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <form id="scheduleEventForm" onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Client Meeting, Court Hearing"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Event Type *</Label>
              <Select 
                value={formData.eventType || ''} 
                onValueChange={(value) => handleInputChange('eventType', value)}
              >
                <SelectTrigger className={errors.eventType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.eventType && (
                <p className="text-sm text-red-500">{errors.eventType}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about the event..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
            />
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Date & Time</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date & Time */}
              <div className="space-y-3">
                <Label className="text-sm">Start</Label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          if (date) {
                            setStartDate(date);
                            handleInputChange('startDate', format(date, 'yyyy-MM-dd'));
                            // Auto-set end date to same day if not set
                            if (!endDate || endDate < date) {
                              setEndDate(date);
                              handleInputChange('endDate', format(date, 'yyyy-MM-dd'));
                            }
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Select 
                    value={formData.startTime} 
                    onValueChange={(time) => {
                      handleInputChange('startTime', time);
                      autoSetEndTime(time);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-3">
                <Label className="text-sm">End</Label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          if (date) {
                            setEndDate(date);
                            handleInputChange('endDate', format(date, 'yyyy-MM-dd'));
                          }
                        }}
                        disabled={(date) => date < startDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Select 
                    value={formData.endTime} 
                    onValueChange={(time) => handleInputChange('endTime', time)}
                  >
                    <SelectTrigger className={errors.endTime ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.endTime && (
                    <p className="text-sm text-red-500">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location / Virtual Meeting */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isVirtual"
                checked={formData.isVirtual}
                onCheckedChange={(checked) => handleInputChange('isVirtual', checked)}
              />
              <Label htmlFor="isVirtual" className="text-sm font-medium">
                Virtual meeting
              </Label>
            </div>

            {formData.isVirtual ? (
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link *</Label>
                <Input
                  id="meetingLink"
                  placeholder="https://zoom.us/j/... or Google Meet link"
                  value={formData.meetingLink}
                  onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                  className={errors.meetingLink ? 'border-red-500' : ''}
                />
                {errors.meetingLink && (
                  <p className="text-sm text-red-500">{errors.meetingLink}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Office address, courtroom, etc."
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label>Attendees</Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add attendee email or name"
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttendee}
                  disabled={!newAttendee.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.attendees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.attendees.map((attendee, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{attendee}</span>
                      <button
                        type="button"
                        onClick={() => removeAttendee(attendee)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reminder and Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reminder</Label>
              <Select 
                value={formData.reminder} 
                onValueChange={(value) => handleInputChange('reminder', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reminderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-7">
              <Switch
                id="clientNotification"
                checked={formData.clientNotification}
                onCheckedChange={(checked) => handleInputChange('clientNotification', checked)}
              />
              <Label htmlFor="clientNotification" className="text-sm font-medium">
                Notify client
              </Label>
            </div>
          </div>

          {/* Event Summary */}
          {formData.title && formData.eventType && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Event Summary</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Event:</strong> {formData.title} ({formData.eventType})</p>
                <p><strong>Matter:</strong> {matter.title}</p>
                <p><strong>Client:</strong> {matter.clientName}</p>
                <p><strong>When:</strong> {formatEventDateTime()}</p>
                {formData.location && !formData.isVirtual && (
                  <p><strong>Where:</strong> {formData.location}</p>
                )}
                {formData.isVirtual && formData.meetingLink && (
                  <p><strong>Meeting Link:</strong> {formData.meetingLink}</p>
                )}
                {formData.attendees.length > 0 && (
                  <p><strong>Attendees:</strong> {formData.attendees.join(', ')}</p>
                )}
              </div>
            </div>
          )}
          </form>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit"
            form="scheduleEventForm"
            disabled={isSubmitting || !formData.title || !formData.eventType}
            className="min-w-[120px]"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleEventModal;
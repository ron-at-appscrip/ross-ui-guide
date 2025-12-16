import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock, Tag, Copy, History } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LEGAL_ACTIVITY_TYPES, TIME_ENTRY_TEMPLATES, TimeEntryData, TimeEntry } from '@/types/timeEntry';
import { MatterService } from '@/services/matterService';

interface TimeEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (timeEntry: TimeEntryData) => void;
  matterId: string;
  matterTitle: string;
  clientName: string;
}

// TimeEntryData is now imported from types

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  open,
  onClose,
  onSubmit,
  matterId,
  matterTitle,
  clientName
}) => {
  const [formData, setFormData] = useState<TimeEntryData>({
    matterId,
    description: '',
    hours: 0,
    rate: 500, // Default rate
    date: new Date().toISOString().split('T')[0],
    billable: true,
    activityType: '',
    tags: []
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showRecentEntries, setShowRecentEntries] = useState(false);

  // Load recent entries when modal opens
  useEffect(() => {
    if (open) {
      loadRecentEntries();
    }
  }, [open]);

  const loadRecentEntries = async () => {
    try {
      const entries = await MatterService.getRecentTimeEntries(5);
      setRecentEntries(entries);
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.activityType) {
      newErrors.activityType = 'Activity type is required';
    }

    if (formData.hours <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    }

    if (formData.hours > 24) {
      newErrors.hours = 'Hours cannot exceed 24 in a day';
    }

    if (formData.rate <= 0) {
      newErrors.rate = 'Rate must be greater than 0';
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
      await onSubmit({
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      
      // Reset form
      setFormData({
        matterId,
        description: '',
        hours: 0,
        rate: 500,
        date: new Date().toISOString().split('T')[0],
        billable: true,
        activityType: '',
        tags: []
      });
      setSelectedDate(new Date());
      onClose();
    } catch (error) {
      console.error('Error submitting time entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TimeEntryData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const totalAmount = formData.hours * formData.rate;

  // Helper functions
  const applyTemplate = (template: typeof TIME_ENTRY_TEMPLATES[0]) => {
    const activityType = LEGAL_ACTIVITY_TYPES.find(type => type.id === template.activityType);
    setFormData(prev => ({
      ...prev,
      description: template.description,
      hours: template.defaultHours,
      activityType: template.activityType,
      billable: template.billable
    }));
    if (activityType) {
      setFormData(prev => ({ ...prev, billable: activityType.defaultBillable }));
    }
    setShowTemplates(false);
  };

  const copyFromRecentEntry = (entry: TimeEntry) => {
    setFormData(prev => ({
      ...prev,
      description: entry.description,
      hours: entry.hours,
      rate: entry.rate,
      activityType: entry.activityType,
      billable: entry.billable,
      tags: entry.tags
    }));
    setShowRecentEntries(false);
  };

  const handleActivityTypeChange = (activityType: string) => {
    const activity = LEGAL_ACTIVITY_TYPES.find(type => type.id === activityType);
    if (activity) {
      setFormData(prev => ({
        ...prev,
        activityType,
        billable: activity.defaultBillable
      }));
    } else {
      handleInputChange('activityType', activityType);
    }
  };

  const getSelectedActivity = () => {
    return LEGAL_ACTIVITY_TYPES.find(type => type.id === formData.activityType);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Add Time Entry</span>
          </DialogTitle>
          <DialogDescription>
            Record time spent on {matterTitle} for {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <form id="timeEntryForm" onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowTemplates(!showTemplates);
                if (!showTemplates) setShowRecentEntries(false);
              }}
              className="flex items-center gap-2"
            >
              <Tag className="h-4 w-4" />
              Templates
            </Button>
            {recentEntries.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRecentEntries(!showRecentEntries);
                  if (!showRecentEntries) setShowTemplates(false);
                }}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                Recent
              </Button>
            )}
          </div>

          {/* Templates Section */}
          {showTemplates && (
            <Card className="mb-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Templates</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 max-h-[180px] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {TIME_ENTRY_TEMPLATES.map((template) => (
                    <Button
                      key={template.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                      className="justify-start h-10 p-2 text-left"
                    >
                      <div>
                        <div className="font-medium text-xs">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.estimatedDuration}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries Section */}
          {showRecentEntries && recentEntries.length > 0 && (
            <Card className="mb-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 max-h-[150px] overflow-y-auto">
                <div className="space-y-1">
                  {recentEntries.slice(0, 3).map((entry) => (
                    <Button
                      key={entry.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyFromRecentEntry(entry)}
                      className="justify-start h-12 p-2 text-left w-full"
                    >
                      <div className="flex items-center gap-2">
                        <Copy className="h-3 w-3" />
                        <div>
                          <div className="font-medium text-xs">{entry.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.hours}h • ${entry.rate}/hr • {entry.activityType.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <div className="space-y-2">
              {/* Quick Date Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant={format(selectedDate, 'yyyy-MM-dd') === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(new Date(Date.now() - 86400000))}
                >
                  Yesterday
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const monday = new Date();
                    monday.setDate(monday.getDate() - monday.getDay() + 1);
                    setSelectedDate(monday);
                  }}
                >
                  This Week
                </Button>
              </div>
              
              {/* Calendar Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Select the date when this work was performed (cannot be in the future)
              </p>
            </div>
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <Label htmlFor="activityType">Activity Type *</Label>
            <Select value={formData.activityType || ''} onValueChange={handleActivityTypeChange}>
              <SelectTrigger className={errors.activityType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select activity type..." />
              </SelectTrigger>
              <SelectContent>
                {LEGAL_ACTIVITY_TYPES.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    <div className="flex items-center gap-2">
                      <Badge className={activity.color} variant="secondary">
                        {activity.name}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activityType && (
              <p className="text-sm text-red-500">{errors.activityType}</p>
            )}
            {getSelectedActivity() && (
              <p className="text-xs text-muted-foreground">{getSelectedActivity()?.description}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the work performed..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Hours and Rate Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0"
                max="24"
                placeholder="0.00"
                value={formData.hours || ''}
                onChange={(e) => handleInputChange('hours', parseFloat(e.target.value) || 0)}
                className={errors.hours ? 'border-red-500' : ''}
              />
              {errors.hours && (
                <p className="text-sm text-red-500">{errors.hours}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="500.00"
                value={formData.rate || ''}
                onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                className={errors.rate ? 'border-red-500' : ''}
              />
              {errors.rate && (
                <p className="text-sm text-red-500">{errors.rate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                <span className="text-sm font-medium">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Billable Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="billable"
              checked={formData.billable}
              onCheckedChange={(checked) => handleInputChange('billable', checked)}
            />
            <Label htmlFor="billable" className="text-sm font-medium">
              Billable time
            </Label>
          </div>

          {/* Summary */}
          {formData.hours > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Time Entry Summary</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Matter:</strong> {matterTitle}</p>
                <p><strong>Client:</strong> {clientName}</p>
                <p><strong>Date:</strong> {format(selectedDate, "PPP")}</p>
                {formData.activityType && (
                  <p><strong>Activity:</strong> {LEGAL_ACTIVITY_TYPES.find(t => t.id === formData.activityType)?.name}</p>
                )}
                <p><strong>Hours:</strong> {formData.hours}</p>
                <p><strong>Rate:</strong> ${formData.rate}/hour</p>
                <p><strong>Amount:</strong> ${totalAmount.toFixed(2)} {formData.billable ? '(Billable)' : '(Non-billable)'}</p>
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
            form="timeEntryForm"
            disabled={isSubmitting || formData.hours <= 0 || !formData.activityType}
            className="min-w-[100px]"
          >
            {isSubmitting ? 'Adding...' : 'Add Time'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryModal;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  Clock, 
  User, 
  Briefcase, 
  Calendar,
  Users,
  FileText,
  Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const callSchema = z.object({
  type: z.enum(['incoming', 'outgoing']),
  duration: z.string().min(1, 'Duration is required'),
  participants: z.string().min(1, 'Participants are required'),
  matter: z.string().optional(),
  purpose: z.string().min(1, 'Call purpose is required'),
  summary: z.string().min(1, 'Call summary is required'),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
  tags: z.string().optional(),
  billable: z.boolean().default(true),
  billableHours: z.string().optional(),
});

type CallFormData = z.infer<typeof callSchema>;

interface LogCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

const LogCallModal = ({ isOpen, onClose, clientId, clientName }: LogCallModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CallFormData>({
    resolver: zodResolver(callSchema),
    defaultValues: {
      type: 'incoming',
      duration: '',
      participants: clientName,
      matter: '',
      purpose: '',
      summary: '',
      followUpRequired: false,
      followUpDate: '',
      followUpNotes: '',
      tags: '',
      billable: true,
      billableHours: '',
    },
  });

  const watchFollowUpRequired = form.watch('followUpRequired');
  const watchBillable = form.watch('billable');

  const callPurposes = [
    'Initial Consultation',
    'Case Strategy Discussion',
    'Document Review',
    'Status Update',
    'Client Check-in',
    'Settlement Discussion',
    'Court Preparation',
    'General Inquiry',
    'Emergency Call',
    'Other'
  ];

  const mockMatters = [
    'Contract Review - Software License',
    'Employment Dispute Resolution', 
    'IP Portfolio Review',
    'General Consultation'
  ];

  const calculateBillableHours = (duration: string) => {
    // Convert duration like "45 minutes" or "1 hour 30 minutes" to decimal hours
    const regex = /(\d+)\s*(hour|hr|h|minute|min|m)/gi;
    let totalMinutes = 0;
    let match;
    
    while ((match = regex.exec(duration)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.startsWith('h')) {
        totalMinutes += value * 60;
      } else if (unit.startsWith('m')) {
        totalMinutes += value;
      }
    }
    
    return (totalMinutes / 60).toFixed(2);
  };

  const handleDurationChange = (value: string) => {
    form.setValue('duration', value);
    if (watchBillable && value) {
      const billableHours = calculateBillableHours(value);
      form.setValue('billableHours', billableHours);
    }
  };

  const handleSubmit = async (data: CallFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Call Logged",
        description: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} call with ${clientName} has been logged successfully.`,
      });
      
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Log Phone Call
          </DialogTitle>
          <DialogDescription>
            Record details of your phone call with {clientName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Call Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Call Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select call type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="incoming">Incoming Call</SelectItem>
                          <SelectItem value="outgoing">Outgoing Call</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g. 30 minutes, 1 hour 15 minutes"
                          onChange={(e) => handleDurationChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participants</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter all call participants" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="matter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Matter (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select related matter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockMatters.map((matter) => (
                            <SelectItem key={matter} value={matter}>
                              {matter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Call Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Call Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Purpose</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select call purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {callPurposes.map((purpose) => (
                            <SelectItem key={purpose} value={purpose}>
                              {purpose}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Provide a detailed summary of the call discussion, key points, and any decisions made..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g. urgent, follow-up-required, billing"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Follow-up Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Follow-up Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="followUpRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Follow-up required</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {watchFollowUpRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="followUpDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Follow-up Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="followUpNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-up Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Describe what follow-up actions are needed..."
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="billable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.checked);
                              if (!e.target.checked) {
                                form.setValue('billableHours', '');
                              } else {
                                const duration = form.getValues('duration');
                                if (duration) {
                                  form.setValue('billableHours', calculateBillableHours(duration));
                                }
                              }
                            }}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This call is billable</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {watchBillable && (
                  <FormField
                    control={form.control}
                    name="billableHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billable Hours</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. 0.5, 1.25"
                            type="number"
                            step="0.01"
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Call Summary Preview */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Call Summary Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {form.watch('type')} call with {form.watch('participants') || clientName}
                    </span>
                  </div>
                  {form.watch('duration') && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duration: {form.watch('duration')}</span>
                    </div>
                  )}
                  {form.watch('matter') && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>Matter: {form.watch('matter')}</span>
                    </div>
                  )}
                  {form.watch('purpose') && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>Purpose: {form.watch('purpose')}</span>
                    </div>
                  )}
                  {watchBillable && form.watch('billableHours') && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Billable: {form.watch('billableHours')} hours
                      </Badge>
                    </div>
                  )}
                  {watchFollowUpRequired && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Follow-up Required
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="gap-3 pt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Logging..." : "Log Call"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LogCallModal;
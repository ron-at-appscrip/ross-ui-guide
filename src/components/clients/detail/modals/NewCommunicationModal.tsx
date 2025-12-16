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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Users,
  Send,
  Save,
  Paperclip,
  Video,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const emailSchema = z.object({
  to: z.string().email('Valid email is required'),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  matter: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  requestReceipt: z.boolean().default(false),
});

const meetingSchema = z.object({
  title: z.string().min(1, 'Meeting title is required'),
  attendees: z.string().min(1, 'Attendees are required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.string().min(1, 'Duration is required'),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  meetingLink: z.string().optional(),
  agenda: z.string().min(1, 'Agenda is required'),
  matter: z.string().optional(),
  notes: z.string().optional(),
});

type EmailFormData = z.infer<typeof emailSchema>;
type MeetingFormData = z.infer<typeof meetingSchema>;

interface NewCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  clientEmail?: string;
}

const NewCommunicationModal = ({ 
  isOpen, 
  onClose, 
  clientId, 
  clientName, 
  clientEmail 
}: NewCommunicationModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('email');

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      to: clientEmail || '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      matter: '',
      priority: 'normal',
      requestReceipt: false,
    },
  });

  const meetingForm = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      attendees: clientName,
      date: '',
      time: '',
      duration: '60',
      location: '',
      isVirtual: false,
      meetingLink: '',
      agenda: '',
      matter: '',
      notes: '',
    },
  });

  const mockMatters = [
    'Contract Review - Software License',
    'Employment Dispute Resolution', 
    'IP Portfolio Review',
    'General Consultation'
  ];

  const emailTemplates = [
    {
      name: 'Case Update',
      subject: 'Update on Your Case - [Matter Name]',
      body: 'Dear [Client Name],\n\nI wanted to provide you with an update on your case...\n\nBest regards,\n[Your Name]'
    },
    {
      name: 'Document Request',
      subject: 'Document Request - [Matter Name]',
      body: 'Dear [Client Name],\n\nTo proceed with your matter, we need the following documents...\n\nThank you,\n[Your Name]'
    },
    {
      name: 'Meeting Follow-up',
      subject: 'Follow-up from Our Meeting',
      body: 'Dear [Client Name],\n\nThank you for meeting with us today. As discussed...\n\nBest regards,\n[Your Name]'
    }
  ];

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Email Sent",
        description: `Email sent successfully to ${data.to}`,
      });
      
      onClose();
      emailForm.reset();
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMeetingSubmit = async (data: MeetingFormData) => {
    setIsLoading(true);
    try {
      // Simulate meeting scheduling
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Meeting Scheduled",
        description: `Meeting "${data.title}" has been scheduled successfully.`,
      });
      
      onClose();
      meetingForm.reset();
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your communication has been saved as a draft.",
    });
  };

  const applyEmailTemplate = (template: typeof emailTemplates[0]) => {
    emailForm.setValue('subject', template.subject.replace('[Matter Name]', 'Your Matter'));
    emailForm.setValue('body', template.body.replace('[Client Name]', clientName).replace('[Your Name]', 'Attorney'));
  };

  const handleClose = () => {
    onClose();
    emailForm.reset();
    meetingForm.reset();
    setActiveTab('email');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            New Communication
          </DialogTitle>
          <DialogDescription>
            Create new communication with {clientName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="meeting" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Meeting
            </TabsTrigger>
          </TabsList>

          {/* Email Tab */}
          <TabsContent value="email">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                {/* Email Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {emailTemplates.map((template, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyEmailTemplate(template)}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Email Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Email Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={emailForm.control}
                        name="to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>To</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="recipient@email.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="cc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CC (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="cc@email.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="matter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Related Matter</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select matter" />
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
                    </div>

                    <FormField
                      control={emailForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Email subject" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Type your message here..."
                              rows={8}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center space-x-2">
                      <FormField
                        control={emailForm.control}
                        name="requestReceipt"
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
                              <FormLabel>Request read receipt</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleSaveDraft}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button type="button" variant="outline">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach Files
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <Send className="h-4 w-4 mr-2" />
                      {isLoading ? "Sending..." : "Send Email"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Meeting Tab */}
          <TabsContent value="meeting">
            <Form {...meetingForm}>
              <form onSubmit={meetingForm.handleSubmit(handleMeetingSubmit)} className="space-y-6">
                {/* Meeting Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Meeting Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={meetingForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter meeting title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={meetingForm.control}
                        name="attendees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attendees</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter attendee names" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={meetingForm.control}
                        name="matter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Related Matter</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select matter" />
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

                      <FormField
                        control={meetingForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={meetingForm.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={meetingForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1.5 hours</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Virtual Meeting Toggle */}
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={meetingForm.control}
                        name="isVirtual"
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
                              <FormLabel>Virtual meeting</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {meetingForm.watch('isVirtual') ? (
                      <FormField
                        control={meetingForm.control}
                        name="meetingLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meeting Link</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://zoom.us/j/..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={meetingForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter meeting location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={meetingForm.control}
                      name="agenda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agenda</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Meeting agenda and topics to discuss..."
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={meetingForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Any additional notes or preparation items..."
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleSaveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {isLoading ? "Scheduling..." : "Schedule Meeting"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NewCommunicationModal;
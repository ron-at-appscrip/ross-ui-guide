import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emailServiceWithDevMode as emailService, EmailSendRequest, EmailLog, EmailTemplate } from '@/services/emailServiceWithDevMode';
import { useToast } from '@/components/ui/use-toast';

// React Query keys for caching
export const emailQueryKeys = {
  all: ['emails'] as const,
  logs: (filters?: any) => [...emailQueryKeys.all, 'logs', filters] as const,
  templates: (type?: string) => [...emailQueryKeys.all, 'templates', type] as const,
  stats: (filters?: any) => [...emailQueryKeys.all, 'stats', filters] as const,
};

/**
 * Hook for sending emails with React Query mutations
 */
export function useEmailOperations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Send generic email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (emailRequest: EmailSendRequest) => emailService.sendEmail(emailRequest),
    onSuccess: (emailLog) => {
      toast({
        title: "Email sent successfully",
        description: `Email sent to ${emailLog.recipient_email}`,
      });
      
      // Invalidate email logs to refetch
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.logs() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.stats() });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send invoice email mutation
  const sendInvoiceEmailMutation = useMutation({
    mutationFn: (invoiceData: Parameters<typeof emailService.sendInvoiceEmail>[0]) => 
      emailService.sendInvoiceEmail(invoiceData),
    onSuccess: (emailLog) => {
      toast({
        title: "Invoice email sent",
        description: `Invoice ${emailLog.metadata?.invoiceNumber || ''} sent to ${emailLog.recipient_email}`,
      });
      
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.logs() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.stats() });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send invoice email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send client communication mutation
  const sendClientCommunicationMutation = useMutation({
    mutationFn: (communicationData: Parameters<typeof emailService.sendClientCommunication>[0]) => 
      emailService.sendClientCommunication(communicationData),
    onSuccess: (emailLog) => {
      toast({
        title: "Communication sent",
        description: `Message sent to ${emailLog.recipient_email}`,
      });
      
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.logs() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.stats() });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send communication",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save email template mutation
  const saveEmailTemplateMutation = useMutation({
    mutationFn: (template: Parameters<typeof emailService.saveEmailTemplate>[0]) => 
      emailService.saveEmailTemplate(template),
    onSuccess: (template) => {
      toast({
        title: "Template saved",
        description: `Email template "${template.name}" saved successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.templates() });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    sendEmail: sendEmailMutation.mutate,
    sendEmailAsync: sendEmailMutation.mutateAsync,
    isSendingEmail: sendEmailMutation.isPending,
    sendEmailError: sendEmailMutation.error,

    sendInvoiceEmail: sendInvoiceEmailMutation.mutate,
    sendInvoiceEmailAsync: sendInvoiceEmailMutation.mutateAsync,
    isSendingInvoice: sendInvoiceEmailMutation.isPending,
    sendInvoiceError: sendInvoiceEmailMutation.error,

    sendClientCommunication: sendClientCommunicationMutation.mutate,
    sendClientCommunicationAsync: sendClientCommunicationMutation.mutateAsync,
    isSendingCommunication: sendClientCommunicationMutation.isPending,
    sendCommunicationError: sendClientCommunicationMutation.error,

    saveEmailTemplate: saveEmailTemplateMutation.mutate,
    saveEmailTemplateAsync: saveEmailTemplateMutation.mutateAsync,
    isSavingTemplate: saveEmailTemplateMutation.isPending,
    saveTemplateError: saveEmailTemplateMutation.error,
  };
}

/**
 * Hook for fetching email logs with filters
 */
export function useEmailLogs(filters?: {
  clientId?: string;
  matterId?: string;
  status?: string;
  emailType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: emailQueryKeys.logs(filters),
    queryFn: () => emailService.getEmailLogs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching email templates
 */
export function useEmailTemplates(templateType?: string) {
  return useQuery({
    queryKey: emailQueryKeys.templates(templateType),
    queryFn: () => emailService.getEmailTemplates(templateType),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching email statistics
 */
export function useEmailStats(filters?: {
  clientId?: string;
  matterId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: emailQueryKeys.stats(filters),
    queryFn: () => emailService.getEmailStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Convenience hook that combines all email operations
 */
export function useEmail() {
  const operations = useEmailOperations();
  
  return {
    ...operations,
    // Additional convenience methods can be added here
  };
}

/**
 * Hook specifically for client communication emails with client context
 */
export function useClientEmail(clientId: string, clientName: string) {
  const { sendClientCommunication, sendInvoiceEmail, ...rest } = useEmailOperations();
  
  const sendQuickCommunication = (data: {
    subject: string;
    message: string;
    clientEmail: string;
    matterId?: string;
    matterName?: string;
    urgency?: 'normal' | 'high' | 'urgent';
    billableTime?: number;
  }) => {
    sendClientCommunication({
      clientId,
      clientName,
      clientEmail: data.clientEmail,
      matterId: data.matterId,
      matterName: data.matterName,
      subject: data.subject,
      message: data.message,
      urgency: data.urgency || 'normal',
      communicationType: 'update',
      billableTime: data.billableTime,
    });
  };

  const sendQuickInvoice = (data: {
    clientEmail: string;
    matterId?: string;
    matterName?: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    lineItems: Array<{
      description: string;
      hours: number;
      rate: number;
      amount: number;
      date: string;
    }>;
    subtotal: number;
    tax?: number;
    total: number;
    paymentInstructions: string;
  }) => {
    sendInvoiceEmail({
      clientId,
      clientName,
      clientEmail: data.clientEmail,
      matterId: data.matterId,
      matterName: data.matterName,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      lineItems: data.lineItems,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      paymentInstructions: data.paymentInstructions,
    });
  };

  return {
    ...rest,
    sendQuickCommunication,
    sendQuickInvoice,
    sendClientCommunication,
    sendInvoiceEmail,
  };
}
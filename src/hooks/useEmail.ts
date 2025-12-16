// React hook for email functionality

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EmailService, EmailRequest, InvoiceEmailRequest, ClientCommunicationRequest, EmailResponse } from '@/services/emailService';

export interface UseEmailOptions {
  onSuccess?: (response: EmailResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

export const useEmail = (options: UseEmailOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { onSuccess, onError, showToast = true } = options;

  // Send basic email
  const sendEmailMutation = useMutation({
    mutationFn: async (request: EmailRequest) => {
      setIsLoading(true);
      return EmailService.sendEmail(request);
    },
    onSuccess: (response) => {
      setIsLoading(false);
      if (showToast && response.success) {
        toast.success('Email sent successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
      onSuccess?.(response);
    },
    onError: (error: Error) => {
      setIsLoading(false);
      if (showToast) {
        toast.error(error.message || 'Failed to send email');
      }
      onError?.(error);
    }
  });

  // Send invoice email
  const sendInvoiceEmailMutation = useMutation({
    mutationFn: async (request: InvoiceEmailRequest) => {
      setIsLoading(true);
      return EmailService.sendInvoiceEmail(request);
    },
    onSuccess: (response) => {
      setIsLoading(false);
      if (showToast && response.success) {
        toast.success('Invoice email sent successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
      queryClient.invalidateQueries({ queryKey: ['client-communications'] });
      onSuccess?.(response);
    },
    onError: (error: Error) => {
      setIsLoading(false);
      if (showToast) {
        toast.error(error.message || 'Failed to send invoice email');
      }
      onError?.(error);
    }
  });

  // Send client communication
  const sendClientCommunicationMutation = useMutation({
    mutationFn: async (request: ClientCommunicationRequest) => {
      setIsLoading(true);
      return EmailService.sendClientCommunication(request);
    },
    onSuccess: (response) => {
      setIsLoading(false);
      if (showToast && response.success) {
        toast.success('Communication sent successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
      queryClient.invalidateQueries({ queryKey: ['client-communications'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
      onSuccess?.(response);
    },
    onError: (error: Error) => {
      setIsLoading(false);
      if (showToast) {
        toast.error(error.message || 'Failed to send communication');
      }
      onError?.(error);
    }
  });

  // Quick send methods
  const sendQuickEmail = async (
    to: string | string[],
    subject: string,
    content: string,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      tags?: string[];
      cc?: string[];
      bcc?: string[];
    }
  ) => {
    return sendEmailMutation.mutateAsync({
      to: Array.isArray(to) ? to : [to],
      cc: options?.cc,
      bcc: options?.bcc,
      subject,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${content}</div>`,
      text: content.replace(/<[^>]*>/g, ''),
      priority: options?.priority || 'normal',
      tags: options?.tags
    });
  };

  const sendTemplatedEmail = async (
    to: string | string[],
    templateId: string,
    variables: Record<string, any>,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      tags?: string[];
      cc?: string[];
      bcc?: string[];
    }
  ) => {
    return sendEmailMutation.mutateAsync({
      to: Array.isArray(to) ? to : [to],
      cc: options?.cc,
      bcc: options?.bcc,
      template_id: templateId,
      template_variables: variables,
      priority: options?.priority || 'normal',
      tags: options?.tags
    });
  };

  return {
    // Send functions
    sendEmail: sendEmailMutation.mutateAsync,
    sendInvoiceEmail: sendInvoiceEmailMutation.mutateAsync,
    sendClientCommunication: sendClientCommunicationMutation.mutateAsync,
    sendQuickEmail,
    sendTemplatedEmail,
    
    // Loading states
    isLoading: isLoading || sendEmailMutation.isPending || sendInvoiceEmailMutation.isPending || sendClientCommunicationMutation.isPending,
    isSendingEmail: sendEmailMutation.isPending,
    isSendingInvoice: sendInvoiceEmailMutation.isPending,
    isSendingCommunication: sendClientCommunicationMutation.isPending,
    
    // Error states
    emailError: sendEmailMutation.error,
    invoiceError: sendInvoiceEmailMutation.error,
    communicationError: sendClientCommunicationMutation.error,
    
    // Reset functions
    reset: () => {
      sendEmailMutation.reset();
      sendInvoiceEmailMutation.reset();
      sendClientCommunicationMutation.reset();
    }
  };
};

// Hook for fetching email logs
export const useEmailLogs = (filters?: {
  client_id?: string;
  matter_id?: string;
  email_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['email-logs', filters],
    queryFn: () => EmailService.getEmailLogs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for fetching a specific email log
export const useEmailLog = (emailId: string) => {
  return useQuery({
    queryKey: ['email-log', emailId],
    queryFn: () => EmailService.getEmailLog(emailId),
    enabled: !!emailId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for fetching email templates
export const useEmailTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['email-templates', category],
    queryFn: () => EmailService.getEmailTemplates(category),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for fetching a specific email template
export const useEmailTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['email-template', templateId],
    queryFn: () => EmailService.getEmailTemplate(templateId),
    enabled: !!templateId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for email statistics
export const useEmailStatistics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['email-statistics', startDate, endDate],
    queryFn: () => EmailService.getEmailStatistics(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for template management
export const useEmailTemplateManager = () => {
  const queryClient = useQueryClient();

  const createTemplateMutation = useMutation({
    mutationFn: EmailService.createEmailTemplate,
    onSuccess: () => {
      toast.success('Email template created successfully');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create email template');
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, updates }: { templateId: string; updates: any }) =>
      EmailService.updateEmailTemplate(templateId, updates),
    onSuccess: () => {
      toast.success('Email template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update email template');
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: EmailService.deleteEmailTemplate,
    onSuccess: () => {
      toast.success('Email template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete email template');
    }
  });

  return {
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: (templateId: string, updates: any) =>
      updateTemplateMutation.mutateAsync({ templateId, updates }),
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
    
    createError: createTemplateMutation.error,
    updateError: updateTemplateMutation.error,
    deleteError: deleteTemplateMutation.error
  };
};

// Utility hook for email composition helpers
export const useEmailComposer = () => {
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const addAttachments = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Basic validation
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`File ${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const clearAttachments = () => {
    setAttachments([]);
  };

  const processAttachments = async () => {
    const processedAttachments = await Promise.all(
      attachments.map(async (file) => {
        return await EmailService.createEmailAttachment(file);
      })
    );
    return processedAttachments;
  };

  return {
    attachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
    processAttachments,
    totalSize: attachments.reduce((total, file) => total + file.size, 0),
    totalCount: attachments.length
  };
};

export default useEmail;
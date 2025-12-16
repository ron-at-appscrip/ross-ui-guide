import type { TrademarkResult, RenewalReminder, NotificationLog, DeadlineInfo } from '@/types/uspto';
import { generateReminderSchedule } from '@/utils/trademarkDeadlines';

export interface RenewalCostEstimate {
  section8Fee: number;
  section71Fee: number;
  renewalFee: number;
  lateRenewalFee?: number;
  totalEstimate: number;
  currency: 'USD';
  lastUpdated: string;
  notes: string[];
}

export interface ReminderSettings {
  email: boolean;
  dashboard: boolean;
  sms?: boolean;
  customSchedule?: number[]; // Custom days before deadline
  escalationEnabled: boolean;
  snoozeHours?: number;
}

export class RenewalService {
  private static readonly USPTO_FEES = {
    section8: 225, // Per class
    section71: 150, // Per class
    renewal: 400, // Per class
    lateRenewal: 100, // Additional per class
    extensionFee: 250 // 6-month extension
  };

  /**
   * Calculate estimated renewal costs for a trademark
   */
  static calculateRenewalCosts(
    trademark: TrademarkResult,
    renewalType: 'section8' | 'section71' | 'renewal' | 'combined' = 'renewal'
  ): RenewalCostEstimate {
    const classCount = trademark.class.length;
    const isOverdue = trademark.deadlines?.nextMajorDeadline?.daysRemaining ? 
      trademark.deadlines.nextMajorDeadline.daysRemaining < 0 : false;

    let section8Fee = 0;
    let section71Fee = 0;
    let renewalFee = 0;
    let lateRenewalFee = 0;
    const notes: string[] = [];

    switch (renewalType) {
      case 'section8':
        section8Fee = this.USPTO_FEES.section8 * classCount;
        notes.push(`Section 8 Declaration: $${this.USPTO_FEES.section8} × ${classCount} classes`);
        break;
      
      case 'section71':
        if (trademark.isForeignBased) {
          section71Fee = this.USPTO_FEES.section71 * classCount;
          notes.push(`Section 71 Declaration: $${this.USPTO_FEES.section71} × ${classCount} classes`);
        } else {
          notes.push('Section 71 not required for US-based registrations');
        }
        break;
      
      case 'renewal':
        renewalFee = this.USPTO_FEES.renewal * classCount;
        notes.push(`Renewal fee: $${this.USPTO_FEES.renewal} × ${classCount} classes`);
        break;
      
      case 'combined':
        section8Fee = this.USPTO_FEES.section8 * classCount;
        renewalFee = this.USPTO_FEES.renewal * classCount;
        notes.push(`Section 8 + Renewal: $${this.USPTO_FEES.section8 + this.USPTO_FEES.renewal} × ${classCount} classes`);
        
        if (trademark.isForeignBased) {
          section71Fee = this.USPTO_FEES.section71 * classCount;
          notes.push(`Section 71 Declaration: $${this.USPTO_FEES.section71} × ${classCount} classes`);
        }
        break;
    }

    if (isOverdue) {
      lateRenewalFee = this.USPTO_FEES.lateRenewal * classCount;
      notes.push(`Late renewal penalty: $${this.USPTO_FEES.lateRenewal} × ${classCount} classes`);
    }

    const totalEstimate = section8Fee + section71Fee + renewalFee + lateRenewalFee;
    
    notes.push('Fees are current as of 2024 and subject to change');
    notes.push('Attorney fees not included in estimate');

    return {
      section8Fee,
      section71Fee,
      renewalFee,
      lateRenewalFee: lateRenewalFee || undefined,
      totalEstimate,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      notes
    };
  }

  /**
   * Schedule renewal reminders for a trademark
   */
  static scheduleRenewalReminders(
    trademark: TrademarkResult,
    settings: ReminderSettings = { email: true, dashboard: true, escalationEnabled: true }
  ): RenewalReminder[] {
    const reminders: RenewalReminder[] = [];

    if (!trademark.deadlines) return reminders;

    // Create reminders for each deadline type
    const deadlineTypes = [
      { type: 'grace_period' as const, deadline: trademark.deadlines.gracePeriod },
      { type: 'renewal' as const, deadline: trademark.deadlines.renewal },
      { type: 'section8' as const, deadline: trademark.deadlines.section8 },
      { type: 'section71' as const, deadline: trademark.deadlines.section71 }
    ];

    deadlineTypes.forEach(({ type, deadline }) => {
      if (!deadline) return;

      const reminderDates = settings.customSchedule 
        ? settings.customSchedule.map(days => {
            const reminderDate = new Date(deadline.date);
            reminderDate.setDate(reminderDate.getDate() - days);
            return reminderDate.toISOString().split('T')[0];
          })
        : generateReminderSchedule(deadline).map(days => {
            const reminderDate = new Date(deadline.date);
            reminderDate.setDate(reminderDate.getDate() - days);
            return reminderDate.toISOString().split('T')[0];
          });

      reminders.push({
        id: `${trademark.id}-${type}-${Date.now()}`,
        type,
        dueDate: deadline.date,
        reminderDates,
        isActive: true,
        notificationsSent: []
      });
    });

    return reminders;
  }

  /**
   * Update reminder settings for a trademark
   */
  static async updateReminderSettings(
    trademarkId: string,
    settings: ReminderSettings
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would update the database
      console.log(`📅 Updating reminder settings for trademark ${trademarkId}:`, settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get renewal status with enhanced information
   */
  static getRenewalStatus(trademark: TrademarkResult): {
    status: 'current' | 'due_soon' | 'overdue' | 'expired';
    nextAction: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    daysUntilAction: number;
    recommendedActions: string[];
  } {
    const nextDeadline = trademark.deadlines?.nextMajorDeadline;
    
    if (!nextDeadline) {
      return {
        status: 'current',
        nextAction: 'Monitor for upcoming deadlines',
        urgency: 'low',
        daysUntilAction: Infinity,
        recommendedActions: ['Set up renewal reminders', 'Review trademark status periodically']
      };
    }

    const { daysRemaining, urgencyLevel } = nextDeadline;
    const recommendedActions: string[] = [];

    if (urgencyLevel === 'critical') {
      recommendedActions.push('File renewal documents immediately');
      recommendedActions.push('Consider expedited processing');
      recommendedActions.push('Contact USPTO or attorney');
    } else if (urgencyLevel === 'high') {
      recommendedActions.push('Prepare renewal documentation');
      recommendedActions.push('Review goods and services');
      recommendedActions.push('Schedule filing within 30 days');
    } else if (urgencyLevel === 'medium') {
      recommendedActions.push('Begin renewal preparation');
      recommendedActions.push('Update ownership information if needed');
      recommendedActions.push('Budget for renewal fees');
    } else {
      recommendedActions.push('Monitor renewal timeline');
      recommendedActions.push('Confirm contact information is current');
    }

    let nextAction = 'Monitor renewal timeline';
    if (daysRemaining < 0) {
      nextAction = 'File overdue renewal immediately';
    } else if (daysRemaining <= 30) {
      nextAction = 'File renewal documents';
    } else if (daysRemaining <= 90) {
      nextAction = 'Prepare renewal filing';
    }

    return {
      status: trademark.renewalStatus || 'current',
      nextAction,
      urgency: urgencyLevel,
      daysUntilAction: daysRemaining,
      recommendedActions
    };
  }

  /**
   * Generate renewal documents (mock implementation)
   */
  static async generateRenewalDocuments(
    trademark: TrademarkResult,
    renewalType: 'section8' | 'section71' | 'renewal' | 'combined'
  ): Promise<{ success: boolean; documents?: any[]; error?: string }> {
    try {
      console.log(`📄 Generating renewal documents for ${trademark.mark} (${renewalType})`);
      
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const documents = [
        {
          type: renewalType,
          filename: `${trademark.serialNumber}-${renewalType}-form.pdf`,
          size: 124800,
          generated: new Date().toISOString()
        }
      ];

      return { success: true, documents };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send renewal reminder notification
   */
  static async sendReminderNotification(
    reminder: RenewalReminder,
    trademark: TrademarkResult,
    notificationType: 'email' | 'dashboard' | 'sms' = 'email'
  ): Promise<NotificationLog> {
    const notificationLog: NotificationLog = {
      id: `notification-${Date.now()}`,
      sentAt: new Date().toISOString(),
      type: notificationType,
      status: 'sent'
    };

    try {
      // Mock notification sending
      console.log(`📧 Sending ${notificationType} reminder for trademark ${trademark.mark}`);
      console.log(`📅 Deadline: ${reminder.dueDate} (${reminder.type})`);
      
      // In a real implementation, this would integrate with email/SMS services
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notificationLog.status = 'sent';
    } catch (error) {
      notificationLog.status = 'failed';
    }

    return notificationLog;
  }

  /**
   * Get renewal timeline for a trademark
   */
  static getRenewalTimeline(trademark: TrademarkResult): Array<{
    date: string;
    type: string;
    description: string;
    status: 'completed' | 'upcoming' | 'overdue';
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const timeline: Array<{
      date: string;
      type: string;
      description: string;
      status: 'completed' | 'upcoming' | 'overdue';
      urgency: 'low' | 'medium' | 'high' | 'critical';
    }> = [];

    if (!trademark.deadlines) return timeline;

    const today = new Date().toISOString().split('T')[0];

    // Add renewal events
    Object.entries(trademark.deadlines).forEach(([type, deadline]) => {
      if (!deadline || type === 'nextMajorDeadline') return;

      let description = '';
      switch (type) {
        case 'section8':
          description = 'Section 8 Declaration due - Affidavit of Use';
          break;
        case 'section71':
          description = 'Section 71 Declaration due - Foreign registration';
          break;
        case 'renewal':
          description = 'Trademark renewal due';
          break;
        case 'gracePeriod':
          description = 'Grace period expires';
          break;
      }

      timeline.push({
        date: deadline.date,
        type,
        description,
        status: deadline.date < today ? 'overdue' : deadline.date === today ? 'overdue' : 'upcoming',
        urgency: deadline.urgencyLevel
      });
    });

    // Sort by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return timeline;
  }
}
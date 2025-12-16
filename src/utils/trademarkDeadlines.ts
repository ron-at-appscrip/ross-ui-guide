// Utility functions for calculating trademark renewal deadlines and grace periods

export interface DeadlineInfo {
  date: string;
  daysRemaining: number;
  status: 'current' | 'due_soon' | 'overdue' | 'expired';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface TrademarkDeadlines {
  gracePeriod?: DeadlineInfo;
  renewal?: DeadlineInfo;
  section8?: DeadlineInfo;
  section71?: DeadlineInfo;
  nextMajorDeadline?: DeadlineInfo;
}

/**
 * Calculate the number of days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date2.getTime() - date1.getTime()) / oneDay);
}

/**
 * Determine urgency level based on days remaining
 */
function getUrgencyLevel(daysRemaining: number): 'low' | 'medium' | 'high' | 'critical' {
  if (daysRemaining < 0) return 'critical'; // Overdue
  if (daysRemaining <= 30) return 'critical';
  if (daysRemaining <= 90) return 'high';
  if (daysRemaining <= 365) return 'medium';
  return 'low';
}

/**
 * Determine status based on days remaining
 */
function getDeadlineStatus(daysRemaining: number): 'current' | 'due_soon' | 'overdue' | 'expired' {
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 90) return 'due_soon';
  return 'current';
}

/**
 * Create deadline info object
 */
function createDeadlineInfo(targetDate: Date): DeadlineInfo {
  const today = new Date();
  const daysRemaining = daysBetween(today, targetDate);
  
  return {
    date: targetDate.toISOString().split('T')[0],
    daysRemaining,
    status: getDeadlineStatus(daysRemaining),
    urgencyLevel: getUrgencyLevel(daysRemaining)
  };
}

/**
 * Calculate trademark grace period deadline
 * Formula: Registration Date + 9 years + 6 months
 */
export function calculateGracePeriodDeadline(registrationDate: string): DeadlineInfo | null {
  try {
    const regDate = new Date(registrationDate);
    if (isNaN(regDate.getTime())) return null;
    
    const gracePeriodDate = new Date(regDate);
    gracePeriodDate.setFullYear(gracePeriodDate.getFullYear() + 9);
    gracePeriodDate.setMonth(gracePeriodDate.getMonth() + 6);
    
    return createDeadlineInfo(gracePeriodDate);
  } catch (error) {
    console.error('Error calculating grace period:', error);
    return null;
  }
}

/**
 * Calculate trademark renewal deadline
 * Formula: Registration Date + 10 years (then every 10 years)
 */
export function calculateRenewalDeadline(registrationDate: string): DeadlineInfo | null {
  try {
    const regDate = new Date(registrationDate);
    if (isNaN(regDate.getTime())) return null;
    
    const today = new Date();
    const regYear = regDate.getFullYear();
    const currentYear = today.getFullYear();
    
    // Calculate next renewal year (10-year cycles)
    let nextRenewalYear = regYear + 10;
    while (nextRenewalYear <= currentYear) {
      nextRenewalYear += 10;
    }
    
    const renewalDate = new Date(regDate);
    renewalDate.setFullYear(nextRenewalYear);
    
    return createDeadlineInfo(renewalDate);
  } catch (error) {
    console.error('Error calculating renewal deadline:', error);
    return null;
  }
}

/**
 * Calculate Section 8 Declaration deadline
 * Formula: Between 5th-6th year after registration, then between 9th-10th year
 */
export function calculateSection8Deadline(registrationDate: string): DeadlineInfo | null {
  try {
    const regDate = new Date(registrationDate);
    if (isNaN(regDate.getTime())) return null;
    
    const today = new Date();
    const regYear = regDate.getFullYear();
    const currentYear = today.getFullYear();
    const yearsSinceReg = currentYear - regYear;
    
    let nextSection8Year: number;
    
    if (yearsSinceReg < 5) {
      // Next deadline is 5th year
      nextSection8Year = regYear + 5;
    } else if (yearsSinceReg < 9) {
      // Next deadline is 9th year
      nextSection8Year = regYear + 9;
    } else {
      // Calculate next 10-year cycle (9th year of each cycle)
      let cycleStart = regYear + 10;
      while (cycleStart + 9 <= currentYear) {
        cycleStart += 10;
      }
      nextSection8Year = cycleStart + 9;
    }
    
    const section8Date = new Date(regDate);
    section8Date.setFullYear(nextSection8Year);
    
    return createDeadlineInfo(section8Date);
  } catch (error) {
    console.error('Error calculating Section 8 deadline:', error);
    return null;
  }
}

/**
 * Calculate Section 71 Declaration deadline (for foreign-based registrations)
 * Formula: Between 5th-6th year after registration
 */
export function calculateSection71Deadline(registrationDate: string, isForeignBased: boolean = false): DeadlineInfo | null {
  if (!isForeignBased) return null;
  
  try {
    const regDate = new Date(registrationDate);
    if (isNaN(regDate.getTime())) return null;
    
    const section71Date = new Date(regDate);
    section71Date.setFullYear(section71Date.getFullYear() + 5);
    
    return createDeadlineInfo(section71Date);
  } catch (error) {
    console.error('Error calculating Section 71 deadline:', error);
    return null;
  }
}

/**
 * Calculate all trademark deadlines
 */
export function calculateAllTrademarkDeadlines(
  registrationDate: string,
  isForeignBased: boolean = false
): TrademarkDeadlines {
  const deadlines: TrademarkDeadlines = {};
  
  if (registrationDate) {
    deadlines.gracePeriod = calculateGracePeriodDeadline(registrationDate);
    deadlines.renewal = calculateRenewalDeadline(registrationDate);
    deadlines.section8 = calculateSection8Deadline(registrationDate);
    
    if (isForeignBased) {
      deadlines.section71 = calculateSection71Deadline(registrationDate, true);
    }
    
    // Find the next major deadline (soonest with high urgency)
    const allDeadlines = [
      deadlines.gracePeriod,
      deadlines.renewal,
      deadlines.section8,
      deadlines.section71
    ].filter(Boolean) as DeadlineInfo[];
    
    if (allDeadlines.length > 0) {
      // Sort by urgency and days remaining
      allDeadlines.sort((a, b) => {
        if (a.urgencyLevel !== b.urgencyLevel) {
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
        }
        return a.daysRemaining - b.daysRemaining;
      });
      
      deadlines.nextMajorDeadline = allDeadlines[0];
    }
  }
  
  return deadlines;
}

/**
 * Get renewal status based on deadlines
 */
export function getRenewalStatus(deadlines: TrademarkDeadlines): 'current' | 'due_soon' | 'overdue' | 'expired' {
  if (!deadlines.nextMajorDeadline) return 'current';
  
  const { daysRemaining, urgencyLevel } = deadlines.nextMajorDeadline;
  
  if (daysRemaining < 0) return 'overdue';
  if (urgencyLevel === 'critical' || urgencyLevel === 'high') return 'due_soon';
  return 'current';
}

/**
 * Format deadline for display
 */
export function formatDeadline(deadline: DeadlineInfo): string {
  const date = new Date(deadline.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  if (deadline.daysRemaining < 0) {
    return `${formattedDate} (${Math.abs(deadline.daysRemaining)} days overdue)`;
  } else if (deadline.daysRemaining === 0) {
    return `${formattedDate} (Due today!)`;
  } else if (deadline.daysRemaining === 1) {
    return `${formattedDate} (Due tomorrow)`;
  } else {
    return `${formattedDate} (${deadline.daysRemaining} days)`;
  }
}

/**
 * Get color class for deadline status
 */
export function getDeadlineColorClass(urgencyLevel: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (urgencyLevel) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Generate reminder schedule (days before deadline)
 */
export function generateReminderSchedule(deadline: DeadlineInfo): number[] {
  const { daysRemaining } = deadline;
  const standardSchedule = [365, 180, 90, 60, 30, 14, 7, 3, 1]; // days before
  
  // Only include reminders that haven't passed yet
  return standardSchedule.filter(days => days < daysRemaining);
}
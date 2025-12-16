import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddClient from '@/pages/dashboard/AddClient';
import ClientService from '@/services/clientService';
import LeadService from '@/services/leadService';
import { LeadStatusBadge, IntakeStageBadge, LeadScoreBadge } from '@/components/lead/LeadStatusBadge';
import { LeadSourceSelector } from '@/components/lead/LeadSourceSelector';

// Mock services to use mock data
jest.mock('@/services/clientService');
jest.mock('@/services/leadService');

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Lead Management System Tests with Mock Data', () => {
  beforeEach(() => {
    // Ensure services use mock data
    jest.clearAllMocks();
  });

  describe('Positive Test Cases', () => {
    test('Lead Lifecycle Progression - Complete Journey', async () => {
      const mockClients = await ClientService.getClients();
      
      // Test GlobalInnovate Inc. - Complete conversion journey
      const globalInnovate = mockClients.find(c => c.id === '1');
      expect(globalInnovate).toBeDefined();
      expect(globalInnovate?.leadStatus).toBe('converted');
      expect(globalInnovate?.leadScore).toBe(95);
      expect(globalInnovate?.intakeStage).toBe('completed');
      expect(globalInnovate?.conversionDate).toBe('2024-01-15');
      
      // Verify progression dates
      expect(new Date(globalInnovate!.qualifiedDate!)).toBeLessThan(new Date(globalInnovate!.consultationDate!));
      expect(new Date(globalInnovate!.consultationDate!)).toBeLessThan(new Date(globalInnovate!.conversionDate!));
    });

    test('Lead Scoring Scenarios - All Temperature Ranges', async () => {
      const mockClients = await ClientService.getClients();
      
      // Hot Lead
      const hotLead = mockClients.find(c => c.id === '10'); // Innovation Labs
      expect(hotLead?.leadScore).toBe(92);
      expect(hotLead?.leadStatus).toBe('prospect');
      
      // Warm Lead
      const warmLead = mockClients.find(c => c.id === '3'); // TechStart Ventures
      expect(warmLead?.leadScore).toBe(88);
      expect(warmLead?.leadStatus).toBe('consultation');
      
      // Cool Lead
      const coolLead = mockClients.find(c => c.id === '4'); // Maria Rodriguez
      expect(coolLead?.leadScore).toBe(72);
      expect(coolLead?.leadStatus).toBe('proposal');
      
      // Cold Lead
      const coldLead = mockClients.find(c => c.id === '9'); // Robert Thompson
      expect(coldLead?.leadScore).toBe(45);
      expect(coldLead?.leadStatus).toBe('lost');
    });

    test('Lead Source Distribution - All Categories', async () => {
      const mockSources = await LeadService.getLeadSources();
      const mockClients = await ClientService.getClients();
      
      // Verify sources exist
      expect(mockSources.length).toBeGreaterThan(0);
      
      // Check different source categories in clients
      const referralClient = mockClients.find(c => c.leadSource === 'Attorney Referral');
      const organicClient = mockClients.find(c => c.leadSource === 'Website Contact Form');
      const advertisingClient = mockClients.find(c => c.leadSource === 'Google Ads');
      const socialClient = mockClients.find(c => c.leadSource === 'LinkedIn');
      
      expect(referralClient).toBeDefined();
      expect(organicClient).toBeDefined();
      expect(advertisingClient).toBeDefined();
      expect(socialClient).toBeDefined();
    });

    test('Client Type Variations - Companies and Individuals', async () => {
      const mockClients = await ClientService.getClients();
      
      const companies = mockClients.filter(c => c.type === 'company');
      const individuals = mockClients.filter(c => c.type === 'person');
      
      expect(companies.length).toBe(6);
      expect(individuals.length).toBe(4);
      
      // Verify individual has person details
      const individual = individuals[0];
      expect(individual.personDetails).toBeDefined();
      expect(individual.personDetails?.firstName).toBeTruthy();
      expect(individual.personDetails?.lastName).toBeTruthy();
    });
  });

  describe('Negative Test Cases', () => {
    test('Failed Conversions - Lost Lead', async () => {
      const mockClients = await ClientService.getClients();
      
      const lostLead = mockClients.find(c => c.id === '9'); // Robert Thompson
      expect(lostLead).toBeDefined();
      expect(lostLead?.leadStatus).toBe('lost');
      expect(lostLead?.leadScore).toBeLessThan(50);
      expect(lostLead?.intakeStage).toBe('qualification');
      expect(lostLead?.conversionDate).toBeUndefined();
    });

    test('Stalled Pipelines - Conflict Check', async () => {
      const mockClients = await ClientService.getClients();
      
      const stalledLead = mockClients.find(c => c.id === '8'); // Wellness Corporation
      expect(stalledLead).toBeDefined();
      expect(stalledLead?.intakeStage).toBe('conflict_check');
      expect(stalledLead?.consultationDate).toBeUndefined();
      expect(stalledLead?.leadStatus).toBe('qualified');
    });

    test('Early Stage Abandonment', async () => {
      const mockClients = await ClientService.getClients();
      
      const earlyLead = mockClients.find(c => c.id === '7'); // Jennifer Walsh
      expect(earlyLead).toBeDefined();
      expect(earlyLead?.intakeStage).toBe('initial');
      expect(earlyLead?.leadScore).toBe(65);
      expect(earlyLead?.qualifiedDate).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('Data Completeness Variations', async () => {
      const mockClients = await ClientService.getClients();
      
      // Missing middle name
      const maria = mockClients.find(c => c.id === '4');
      expect(maria?.personDetails?.middleName).toBe('');
      
      // No websites
      const clientsWithoutWebsites = mockClients.filter(c => c.websites.length === 0);
      expect(clientsWithoutWebsites.length).toBeGreaterThan(0);
      
      // No referral source
      const noReferral = mockClients.filter(c => !c.referralSource);
      expect(noReferral.length).toBeGreaterThan(0);
    });

    test('Score Boundary Cases', async () => {
      const mockClients = await ClientService.getClients();
      
      // Exactly at threshold
      const boundaryLead = mockClients.find(c => c.leadScore === 45);
      expect(boundaryLead).toBeDefined();
      
      // High score but still prospect
      const highScoreProspect = mockClients.find(c => c.leadScore! > 90 && c.leadStatus === 'prospect');
      expect(highScoreProspect).toBeDefined();
      
      // Mid-range scores
      const midRangeLeads = mockClients.filter(c => c.leadScore! >= 65 && c.leadScore! <= 77);
      expect(midRangeLeads.length).toBeGreaterThan(0);
    });

    test('Stage-Status Mismatches', async () => {
      const mockClients = await ClientService.getClients();
      
      // Active but still showing as prospect in the journey
      const activeProspect = mockClients.find(c => c.status === 'active' && c.leadStatus === 'converted');
      expect(activeProspect).toBeDefined();
      
      // Lost but was in mid-stage
      const lostMidStage = mockClients.find(c => c.leadStatus === 'lost' && c.intakeStage !== 'initial');
      expect(lostMidStage).toBeDefined();
    });

    test('Timeline Anomalies', async () => {
      const mockClients = await ClientService.getClients();
      
      // Same day activity
      const sameDayActivity = mockClients.find(c => c.dateAdded === c.lastActivity);
      expect(sameDayActivity).toBeDefined();
      
      // Quick progression (5 days or less)
      const quickConversion = mockClients.find(c => {
        if (c.qualifiedDate && c.conversionDate) {
          const days = (new Date(c.conversionDate).getTime() - new Date(c.qualifiedDate).getTime()) / (1000 * 60 * 60 * 24);
          return days <= 5;
        }
        return false;
      });
      expect(quickConversion).toBeDefined();
    });
  });

  describe('UI Component Tests', () => {
    test('LeadStatusBadge - All Status Types', () => {
      const statuses = ['prospect', 'qualified', 'consultation', 'proposal', 'converted', 'lost'] as const;
      
      statuses.forEach(status => {
        const { container } = render(<LeadStatusBadge status={status} />);
        const badge = container.querySelector('.bg-blue-100, .bg-yellow-100, .bg-purple-100, .bg-orange-100, .bg-green-100, .bg-red-100');
        expect(badge).toBeInTheDocument();
      });
    });

    test('IntakeStageBadge - All Stage Types', () => {
      const stages = ['initial', 'qualification', 'conflict_check', 'consultation', 'proposal', 'onboarding', 'completed'] as const;
      
      stages.forEach(stage => {
        const { container } = render(<IntakeStageBadge stage={stage} />);
        const badge = container.querySelector('[class*="bg-"]');
        expect(badge).toBeInTheDocument();
      });
    });

    test('LeadScoreBadge - Score Ranges', () => {
      const scores = [25, 45, 65, 85];
      const expectedLabels = ['Cold', 'Cool', 'Warm', 'Hot'];
      
      scores.forEach((score, index) => {
        const { getByText } = render(<LeadScoreBadge score={score} />);
        expect(getByText(score.toString())).toBeInTheDocument();
        expect(getByText(`(${expectedLabels[index]})`)).toBeInTheDocument();
      });
    });

    test('AddClient Form - Lead Management Section', () => {
      const { getByText, queryByText } = renderWithRouter(<AddClient />);
      
      // Initially hidden
      expect(queryByText('Lead Status')).not.toBeInTheDocument();
      
      // Click to show lead management
      const leadManagementButton = getByText('Lead Management');
      fireEvent.click(leadManagementButton);
      
      // Now visible
      expect(getByText('Lead Status')).toBeInTheDocument();
      expect(getByText('Intake Stage')).toBeInTheDocument();
      expect(getByText('Lead Source')).toBeInTheDocument();
      expect(getByText('Lead Score')).toBeInTheDocument();
    });
  });

  describe('Business Logic Tests', () => {
    test('Lead Quality Indicators', async () => {
      const mockClients = await ClientService.getClients();
      
      // High-value indicators
      const highValueLeads = mockClients.filter(c => 
        c.leadSource?.includes('Referral') || 
        c.tags.includes('High Value') ||
        c.tags.includes('VIP')
      );
      
      expect(highValueLeads.length).toBeGreaterThan(0);
      
      // Check average score is higher for referrals
      const referralLeads = mockClients.filter(c => c.leadSource?.includes('Referral'));
      const nonReferralLeads = mockClients.filter(c => !c.leadSource?.includes('Referral'));
      
      const avgReferralScore = referralLeads.reduce((sum, c) => sum + (c.leadScore || 0), 0) / referralLeads.length;
      const avgNonReferralScore = nonReferralLeads.reduce((sum, c) => sum + (c.leadScore || 0), 0) / nonReferralLeads.length;
      
      expect(avgReferralScore).toBeGreaterThan(avgNonReferralScore);
    });

    test('Conversion Patterns', async () => {
      const mockClients = await ClientService.getClients();
      
      // Fast track conversions
      const fastTrack = mockClients.filter(c => {
        if (c.leadSource?.includes('Referral') && c.conversionDate && c.qualifiedDate) {
          const days = (new Date(c.conversionDate).getTime() - new Date(c.qualifiedDate).getTime()) / (1000 * 60 * 60 * 24);
          return days <= 7;
        }
        return false;
      });
      
      expect(fastTrack.length).toBeGreaterThan(0);
    });

    test('Practice Area Distribution', async () => {
      const mockClients = await ClientService.getClients();
      
      const practiceAreas = {
        corporate: mockClients.filter(c => c.tags.includes('Corporate Law') || c.tags.includes('Corporate')),
        employment: mockClients.filter(c => c.tags.includes('Employment Law')),
        family: mockClients.filter(c => c.tags.includes('Family Law')),
        ip: mockClients.filter(c => c.tags.includes('IP') || c.tags.includes('Patent Law')),
        realEstate: mockClients.filter(c => c.tags.includes('Real Estate'))
      };
      
      expect(practiceAreas.corporate.length).toBeGreaterThan(0);
      expect(practiceAreas.employment.length).toBeGreaterThan(0);
      expect(practiceAreas.family.length).toBeGreaterThan(0);
      expect(practiceAreas.ip.length).toBeGreaterThan(0);
      expect(practiceAreas.realEstate.length).toBeGreaterThan(0);
    });
  });

  describe('Lead Score Calculation', () => {
    test('Calculate lead score based on factors', () => {
      const factors = {
        matterUrgency: 80,
        budgetRange: 90,
        referralQuality: 85,
        responseTime: 70,
        practiceAreaMatch: 75,
        geographicMatch: 80
      };
      
      const score = LeadService.calculateLeadScore(factors);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBeGreaterThan(75); // Should be a warm/hot lead
    });

    test('Lead score boundaries', () => {
      // Minimum score
      const minFactors = {
        matterUrgency: 0,
        budgetRange: 0,
        referralQuality: 0,
        responseTime: 0,
        practiceAreaMatch: 0,
        geographicMatch: 0
      };
      
      expect(LeadService.calculateLeadScore(minFactors)).toBe(0);
      
      // Maximum score
      const maxFactors = {
        matterUrgency: 100,
        budgetRange: 100,
        referralQuality: 100,
        responseTime: 100,
        practiceAreaMatch: 100,
        geographicMatch: 100
      };
      
      expect(LeadService.calculateLeadScore(maxFactors)).toBe(100);
    });
  });
});
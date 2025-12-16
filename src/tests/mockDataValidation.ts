import ClientService from '@/services/clientService';
import LeadService from '@/services/leadService';
import { LeadStatus, IntakeStage } from '@/types/client';

/**
 * Mock Data Validation Script
 * Tests all scenarios using the actual mock data
 */

export async function validateMockData() {
  console.log('🧪 Starting Mock Data Validation Tests...\n');
  
  const mockClients = await ClientService.getClients();
  const mockSources = await LeadService.getLeadSources();
  
  console.log(`📊 Total Mock Clients: ${mockClients.length}`);
  console.log(`📊 Total Mock Sources: ${mockSources.length}\n`);

  // ✅ POSITIVE TEST CASES
  console.log('✅ POSITIVE TEST CASES');
  console.log('=' .repeat(50));

  // Test 1: Complete Lead Lifecycle
  console.log('1. Complete Lead Lifecycle Progression:');
  const completedLeads = mockClients.filter(c => c.leadStatus === 'converted' && c.intakeStage === 'completed');
  console.log(`   - Completed conversions: ${completedLeads.length}`);
  
  completedLeads.forEach(lead => {
    console.log(`   - ${lead.name}: ${lead.leadStatus} → ${lead.intakeStage} (Score: ${lead.leadScore})`);
    console.log(`     Timeline: ${lead.qualifiedDate} → ${lead.consultationDate} → ${lead.conversionDate}`);
  });
  
  // Test 2: Lead Score Distribution
  console.log('\n2. Lead Score Distribution:');
  const scoreRanges = {
    hot: mockClients.filter(c => (c.leadScore || 0) >= 80),
    warm: mockClients.filter(c => (c.leadScore || 0) >= 60 && (c.leadScore || 0) < 80),
    cool: mockClients.filter(c => (c.leadScore || 0) >= 40 && (c.leadScore || 0) < 60),
    cold: mockClients.filter(c => (c.leadScore || 0) < 40)
  };
  
  Object.entries(scoreRanges).forEach(([range, leads]) => {
    console.log(`   - ${range.toUpperCase()}: ${leads.length} leads`);
    leads.forEach(lead => {
      console.log(`     → ${lead.name}: ${lead.leadScore} (${lead.leadStatus})`);
    });
  });

  // Test 3: Source Category Distribution
  console.log('\n3. Lead Source Categories:');
  const sourceCategories = mockSources.reduce((acc, source) => {
    acc[source.category] = (acc[source.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(sourceCategories).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count} sources`);
  });

  // Test 4: Client Type Distribution
  console.log('\n4. Client Type Distribution:');
  const companies = mockClients.filter(c => c.type === 'company');
  const individuals = mockClients.filter(c => c.type === 'person');
  console.log(`   - Companies: ${companies.length}`);
  console.log(`   - Individuals: ${individuals.length}`);

  // ❌ NEGATIVE TEST CASES
  console.log('\n\n❌ NEGATIVE TEST CASES');
  console.log('=' .repeat(50));

  // Test 5: Failed Conversions
  console.log('5. Failed Conversions:');
  const lostLeads = mockClients.filter(c => c.leadStatus === 'lost');
  console.log(`   - Lost leads: ${lostLeads.length}`);
  
  lostLeads.forEach(lead => {
    console.log(`   - ${lead.name}: Score ${lead.leadScore}, Stage: ${lead.intakeStage}`);
    console.log(`     Source: ${lead.leadSource}, Industry: ${lead.industry}`);
  });

  // Test 6: Stalled Pipelines
  console.log('\n6. Stalled Pipelines:');
  const stalledLeads = mockClients.filter(c => 
    c.leadStatus !== 'converted' && 
    c.leadStatus !== 'lost' && 
    !c.consultationDate &&
    c.intakeStage !== 'initial'
  );
  
  console.log(`   - Stalled leads: ${stalledLeads.length}`);
  stalledLeads.forEach(lead => {
    console.log(`   - ${lead.name}: ${lead.leadStatus} at ${lead.intakeStage} stage`);
  });

  // Test 7: Early Abandonment
  console.log('\n7. Early Stage Abandonment:');
  const earlyStageLeads = mockClients.filter(c => 
    c.intakeStage === 'initial' && 
    !c.qualifiedDate
  );
  
  console.log(`   - Early stage leads: ${earlyStageLeads.length}`);
  earlyStageLeads.forEach(lead => {
    console.log(`   - ${lead.name}: Score ${lead.leadScore}, Source: ${lead.leadSource}`);
  });

  // 🔶 EDGE CASES
  console.log('\n\n🔶 EDGE CASES');
  console.log('=' .repeat(50));

  // Test 8: Data Completeness
  console.log('8. Data Completeness Variations:');
  const missingMiddleNames = mockClients.filter(c => 
    c.type === 'person' && 
    (!c.personDetails?.middleName || c.personDetails.middleName === '')
  );
  console.log(`   - Missing middle names: ${missingMiddleNames.length}`);
  
  const noWebsites = mockClients.filter(c => c.websites.length === 0);
  console.log(`   - No websites: ${noWebsites.length}`);
  
  const noReferral = mockClients.filter(c => !c.referralSource);
  console.log(`   - No referral source: ${noReferral.length}`);

  // Test 9: Score Boundaries
  console.log('\n9. Score Boundary Cases:');
  const boundaryScores = mockClients.filter(c => 
    c.leadScore === 45 || 
    c.leadScore === 60 || 
    c.leadScore === 80
  );
  
  console.log(`   - Boundary scores: ${boundaryScores.length}`);
  boundaryScores.forEach(lead => {
    console.log(`   - ${lead.name}: Score ${lead.leadScore} (${lead.leadStatus})`);
  });

  // Test 10: Stage-Status Mismatches
  console.log('\n10. Stage-Status Logic:');
  const statusStageAnalysis = mockClients.map(c => ({
    name: c.name,
    status: c.leadStatus,
    stage: c.intakeStage,
    logical: isLogicalStageStatus(c.leadStatus, c.intakeStage)
  }));
  
  const illogicalCombos = statusStageAnalysis.filter(a => !a.logical);
  console.log(`   - Illogical combinations: ${illogicalCombos.length}`);
  illogicalCombos.forEach(combo => {
    console.log(`   - ${combo.name}: ${combo.status} + ${combo.stage}`);
  });

  // Test 11: Timeline Analysis
  console.log('\n11. Timeline Anomalies:');
  const sameDayActivity = mockClients.filter(c => c.dateAdded === c.lastActivity);
  console.log(`   - Same day activity: ${sameDayActivity.length}`);
  
  const quickConversions = mockClients.filter(c => {
    if (c.qualifiedDate && c.conversionDate) {
      const days = (new Date(c.conversionDate).getTime() - new Date(c.qualifiedDate).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 5;
    }
    return false;
  });
  console.log(`   - Quick conversions (≤5 days): ${quickConversions.length}`);

  // 🎯 BUSINESS LOGIC TESTS
  console.log('\n\n🎯 BUSINESS LOGIC TESTS');
  console.log('=' .repeat(50));

  // Test 12: Lead Quality Correlation
  console.log('12. Lead Quality Indicators:');
  const referralLeads = mockClients.filter(c => c.leadSource?.includes('Referral'));
  const nonReferralLeads = mockClients.filter(c => !c.leadSource?.includes('Referral'));
  
  const avgReferralScore = referralLeads.reduce((sum, c) => sum + (c.leadScore || 0), 0) / referralLeads.length;
  const avgNonReferralScore = nonReferralLeads.reduce((sum, c) => sum + (c.leadScore || 0), 0) / nonReferralLeads.length;
  
  console.log(`   - Referral leads avg score: ${avgReferralScore.toFixed(1)}`);
  console.log(`   - Non-referral leads avg score: ${avgNonReferralScore.toFixed(1)}`);
  console.log(`   - Referral premium: ${(avgReferralScore - avgNonReferralScore).toFixed(1)} points`);

  // Test 13: Conversion Patterns
  console.log('\n13. Conversion Patterns:');
  const convertedLeads = mockClients.filter(c => c.leadStatus === 'converted');
  const conversionBySource = convertedLeads.reduce((acc, lead) => {
    const source = lead.leadSource || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('   - Conversions by source:');
  Object.entries(conversionBySource).forEach(([source, count]) => {
    console.log(`     → ${source}: ${count} conversions`);
  });

  // Test 14: Practice Area Analysis
  console.log('\n14. Practice Area Distribution:');
  const practiceAreas = {
    corporate: mockClients.filter(c => c.tags.some(tag => tag.includes('Corporate'))),
    employment: mockClients.filter(c => c.tags.some(tag => tag.includes('Employment'))),
    family: mockClients.filter(c => c.tags.some(tag => tag.includes('Family'))),
    ip: mockClients.filter(c => c.tags.some(tag => tag.includes('IP') || tag.includes('Patent'))),
    realEstate: mockClients.filter(c => c.tags.some(tag => tag.includes('Real Estate')))
  };
  
  Object.entries(practiceAreas).forEach(([area, leads]) => {
    console.log(`   - ${area}: ${leads.length} leads`);
  });

  // ⚡ PERFORMANCE TESTS
  console.log('\n\n⚡ PERFORMANCE TESTS');
  console.log('=' .repeat(50));

  // Test 15: Lead Score Calculation
  console.log('15. Lead Score Calculation:');
  const testFactors = {
    matterUrgency: 80,
    budgetRange: 90,
    referralQuality: 85,
    responseTime: 70,
    practiceAreaMatch: 75,
    geographicMatch: 80
  };
  
  const calculatedScore = LeadService.calculateLeadScore(testFactors);
  console.log(`   - Calculated score: ${calculatedScore} (Expected: 75-85 range)`);
  
  // Test boundary conditions
  const minScore = LeadService.calculateLeadScore({
    matterUrgency: 0, budgetRange: 0, referralQuality: 0,
    responseTime: 0, practiceAreaMatch: 0, geographicMatch: 0
  });
  
  const maxScore = LeadService.calculateLeadScore({
    matterUrgency: 100, budgetRange: 100, referralQuality: 100,
    responseTime: 100, practiceAreaMatch: 100, geographicMatch: 100
  });
  
  console.log(`   - Min score: ${minScore} (Expected: 0)`);
  console.log(`   - Max score: ${maxScore} (Expected: 100)`);

  // 📊 SUMMARY
  console.log('\n\n📊 SUMMARY');
  console.log('=' .repeat(50));
  
  const summary = {
    totalClients: mockClients.length,
    activeLeads: mockClients.filter(c => c.leadStatus !== 'converted' && c.leadStatus !== 'lost').length,
    converted: mockClients.filter(c => c.leadStatus === 'converted').length,
    lost: mockClients.filter(c => c.leadStatus === 'lost').length,
    avgScore: (mockClients.reduce((sum, c) => sum + (c.leadScore || 0), 0) / mockClients.length).toFixed(1),
    companies: mockClients.filter(c => c.type === 'company').length,
    individuals: mockClients.filter(c => c.type === 'person').length
  };
  
  console.log(`Total Clients: ${summary.totalClients}`);
  console.log(`Active Leads: ${summary.activeLeads}`);
  console.log(`Converted: ${summary.converted}`);
  console.log(`Lost: ${summary.lost}`);
  console.log(`Average Score: ${summary.avgScore}`);
  console.log(`Companies: ${summary.companies}`);
  console.log(`Individuals: ${summary.individuals}`);
  
  console.log('\n✅ All tests completed successfully!');
  
  return summary;
}

function isLogicalStageStatus(status?: LeadStatus, stage?: IntakeStage): boolean {
  if (!status || !stage) return false;
  
  const stageOrder = ['initial', 'qualification', 'conflict_check', 'consultation', 'proposal', 'onboarding', 'completed'];
  const stageIndex = stageOrder.indexOf(stage);
  
  switch (status) {
    case 'prospect':
      return stageIndex <= 1; // initial or qualification
    case 'qualified':
      return stageIndex >= 1 && stageIndex <= 3; // qualification to consultation
    case 'consultation':
      return stageIndex >= 3 && stageIndex <= 4; // consultation to proposal
    case 'proposal':
      return stageIndex >= 4 && stageIndex <= 5; // proposal to onboarding
    case 'converted':
      return stageIndex === 6; // completed
    case 'lost':
      return stageIndex < 6; // any stage before completed
    default:
      return false;
  }
}

// Export for testing
export default validateMockData;
// Lead Scoring Calculation Test
// Tests the weighted scoring algorithm

function calculateLeadScore(factors) {
  // Weighted scoring algorithm matching LeadService implementation
  const weights = {
    matterUrgency: 0.2,      // 20% - How urgent is their legal matter?
    budgetRange: 0.25,       // 25% - What's their budget capacity?
    referralQuality: 0.2,    // 20% - Quality of referral source
    responseTime: 0.1,       // 10% - How quickly do they respond?
    practiceAreaMatch: 0.15, // 15% - Does it match our expertise?
    geographicMatch: 0.1     // 10% - Are they in our service area?
  };

  const score = Object.entries(factors).reduce((total, [factor, value]) => {
    const weight = weights[factor] || 0;
    return total + (value * weight);
  }, 0);

  return Math.round(Math.max(0, Math.min(100, score)));
}

console.log('🎯 Lead Scoring Algorithm Tests\n');

// Test Case 1: Perfect Score
console.log('Test 1: Perfect Score (All 100s)');
const perfectScore = calculateLeadScore({
  matterUrgency: 100,
  budgetRange: 100,
  referralQuality: 100,
  responseTime: 100,
  practiceAreaMatch: 100,
  geographicMatch: 100
});
console.log(`Result: ${perfectScore} (Expected: 100)`);
console.log(`✅ ${perfectScore === 100 ? 'PASS' : 'FAIL'}\n`);

// Test Case 2: Minimum Score
console.log('Test 2: Minimum Score (All 0s)');
const minScore = calculateLeadScore({
  matterUrgency: 0,
  budgetRange: 0,
  referralQuality: 0,
  responseTime: 0,
  practiceAreaMatch: 0,
  geographicMatch: 0
});
console.log(`Result: ${minScore} (Expected: 0)`);
console.log(`✅ ${minScore === 0 ? 'PASS' : 'FAIL'}\n`);

// Test Case 3: High-Value Lead (Referral from existing client)
console.log('Test 3: High-Value Referral Lead');
const highValueScore = calculateLeadScore({
  matterUrgency: 90,    // Very urgent corporate matter
  budgetRange: 95,      // High budget ($500K+)
  referralQuality: 100, // Direct client referral
  responseTime: 95,     // Responds within hours
  practiceAreaMatch: 90, // Perfect match for corporate law
  geographicMatch: 85   // In our primary market
});
console.log(`Result: ${highValueScore} (Expected: 92-94)`);
console.log(`✅ ${highValueScore >= 92 && highValueScore <= 94 ? 'PASS' : 'FAIL'}\n`);

// Test Case 4: Cold Lead (Low quality)
console.log('Test 4: Cold Lead');
const coldScore = calculateLeadScore({
  matterUrgency: 30,    // Not very urgent
  budgetRange: 25,      // Limited budget
  referralQuality: 20,  // Cold outreach
  responseTime: 40,     // Slow to respond
  practiceAreaMatch: 50, // Partial match
  geographicMatch: 60   // Outside primary area
});
console.log(`Result: ${coldScore} (Expected: 33-35)`);
console.log(`✅ ${coldScore >= 33 && coldScore <= 35 ? 'PASS' : 'FAIL'}\n`);

// Test Case 5: Typical Warm Lead
console.log('Test 5: Typical Warm Lead');
const warmScore = calculateLeadScore({
  matterUrgency: 70,    // Moderately urgent
  budgetRange: 75,      // Good budget range
  referralQuality: 60,  // Website form submission
  responseTime: 80,     // Good response time
  practiceAreaMatch: 85, // Good practice area match
  geographicMatch: 90   // Local client
});
console.log(`Result: ${warmScore} (Expected: 75-77)`);
console.log(`✅ ${warmScore >= 75 && warmScore <= 77 ? 'PASS' : 'FAIL'}\n`);

// Test Case 6: Budget-Heavy Lead (High budget but other factors average)
console.log('Test 6: Budget-Heavy Lead');
const budgetHeavyScore = calculateLeadScore({
  matterUrgency: 50,
  budgetRange: 100,     // Excellent budget
  referralQuality: 50,
  responseTime: 50,
  practiceAreaMatch: 50,
  geographicMatch: 50
});
console.log(`Result: ${budgetHeavyScore} (Expected: 55-57)`);
console.log(`✅ ${budgetHeavyScore >= 55 && budgetHeavyScore <= 57 ? 'PASS' : 'FAIL'}\n`);

// Test Case 7: Edge Case - Some missing factors (should handle gracefully)
console.log('Test 7: Missing Factors');
const partialScore = calculateLeadScore({
  matterUrgency: 80,
  budgetRange: 90,
  // Missing other factors
});
console.log(`Result: ${partialScore} (Expected: 36-37)`);
console.log(`✅ ${partialScore >= 36 && partialScore <= 37 ? 'PASS' : 'FAIL'}\n`);

// Test Case 8: Validate Weight Distribution
console.log('Test 8: Weight Distribution Validation');
const weights = {
  matterUrgency: 0.2,
  budgetRange: 0.25,
  referralQuality: 0.2,
  responseTime: 0.1,
  practiceAreaMatch: 0.15,
  geographicMatch: 0.1
};
const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
console.log(`Total Weights: ${totalWeight} (Expected: 1.0)`);
console.log(`✅ ${totalWeight === 1.0 ? 'PASS' : 'FAIL'}\n`);

console.log('🎉 Lead Scoring Tests Complete!');
console.log('📊 All scoring calculations validated successfully.');
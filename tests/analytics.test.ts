import { describe, it, expect } from 'vitest';
import { calculateCampaignMetrics } from '../src/lib/analytics';
import { generateRecommendations } from '../src/lib/recommendations';
import { CAMPAIGN_TARGETS, BUDGET_ALLOCATIONS } from '../src/lib/constants';

describe('Growth Dashboard Analytics & Recommendations', () => {
  it('calculates campaign metrics from existing database state', async () => {
    const metrics = await calculateCampaignMetrics();

    expect(metrics.totalTarget).toBe(500);
    expect(metrics.uniqueRegistrations).toBeGreaterThanOrEqual(200);
    expect(metrics.remainingRegistrations).toBe(500 - metrics.uniqueRegistrations);
    expect(metrics.progressPercentage).toBe(
      Math.min(100, Math.round((metrics.uniqueRegistrations / 500) * 100))
    );

    // Days & Run Rate
    expect(metrics.totalCampaignDays).toBe(7);
    expect(metrics.currentCampaignDay).toBe(4);
    expect(metrics.remainingDays).toBe(4); // Day 4, 5, 6, 7 = 4 remaining days
    expect(metrics.requiredDailyRunRate).toBe(
      Math.ceil(metrics.remainingRegistrations / metrics.remainingDays)
    );

    // Budget
    expect(metrics.budget.totalPlanned).toBe(BUDGET_ALLOCATIONS.TOTAL);
    expect(metrics.budget.totalPlanned).toBe(2000);
    expect(metrics.budget.remaining).toBe(2000 - metrics.budget.totalActual);
    expect(metrics.budget.categories.length).toBe(3);

    // Channels
    expect(metrics.channels.length).toBe(5);
    const totalByChannels = metrics.channels.reduce((sum, ch) => sum + ch.actual, 0);
    expect(totalByChannels).toBe(metrics.uniqueRegistrations);

    // Leaderboard
    expect(metrics.partnerLeaderboard.length).toBeGreaterThan(0);
    expect(metrics.partnerLeaderboard[0].rank).toBe(1);
    expect(metrics.partnerLeaderboard[0].registrations).toBeGreaterThanOrEqual(
      metrics.partnerLeaderboard[1]?.registrations || 0
    );
  });

  it('audits exact 263 arithmetic reconciliation and recommendation wording', async () => {
    const metrics = await calculateCampaignMetrics();

    // Verify exact channel counts for demo simulation
    const partnerChannel = metrics.channels.find((c) => c.channelKey === 'CAMPUS_PARTNER')!;
    const studentChannel = metrics.channels.find((c) => c.channelKey === 'STUDENT_REFERRAL')!;
    const commChannel = metrics.channels.find((c) => c.channelKey === 'COLLEGE_COMMUNITIES')!;
    const emailChannel = metrics.channels.find((c) => c.channelKey === 'TARGETED_EMAIL')!;
    const directChannel = metrics.channels.find((c) => c.channelKey === 'DIRECT')!;

    expect(partnerChannel.actual).toBe(146);
    expect(studentChannel.actual).toBe(50);
    expect(commChannel.actual).toBe(32);
    expect(emailChannel.actual).toBe(20);
    expect(directChannel.actual).toBe(15);

    // Sum verification: 146 + 50 + 32 + 20 + 15 = 263
    const sum =
      partnerChannel.actual +
      studentChannel.actual +
      commChannel.actual +
      emailChannel.actual +
      directChannel.actual;
    expect(sum).toBe(263);
    expect(metrics.uniqueRegistrations).toBe(263);

    // Targets & Pacing verification
    expect(metrics.totalTarget).toBe(500);
    expect(metrics.remainingRegistrations).toBe(237);
    expect(metrics.currentCampaignDay).toBe(4);
    expect(metrics.remainingDays).toBe(4);
    expect(metrics.requiredDailyRunRate).toBe(60); // ceil(237 / 4) = 60
    expect(metrics.currentDailyAverage).toBe(65.8); // 263 / 4 = 65.75 rounded to 65.8

    // Partner metrics sum to 146
    const totalPartnerRegs = metrics.partnerLeaderboard.reduce((s, p) => s + p.registrations, 0);
    expect(totalPartnerRegs).toBe(146);

    // Recommendation wording audit
    const recommendations = generateRecommendations(metrics);
    const runRateRec = recommendations.find((r) => r.id === 'rec-run-rate')!;
    expect(runRateRec).toBeDefined();

    // Must describe as currently ahead of required average pace
    expect(runRateRec.summary).toContain('currently ahead of the required average pace');
    // Must explain sustained performance is not guaranteed
    expect(runRateRec.summary).toContain('sustained performance is not guaranteed');
    // Must clearly distinguish average pace from most recent day
    expect(runRateRec.summary).toContain('distinct from Day 4');
    expect(runRateRec.summary).toContain('60 per day rounded up');
    expect(runRateRec.summary).toContain('65.8/day');
  });

  it('generates deterministic recommendations backed by actual campaign numbers', async () => {
    const metrics = await calculateCampaignMetrics();
    const recommendations = generateRecommendations(metrics);

    expect(recommendations.length).toBeGreaterThan(0);

    const runRateRec = recommendations.find((r) => r.id === 'rec-run-rate');
    expect(runRateRec).toBeDefined();
    expect(runRateRec?.summary).toContain(`${metrics.requiredDailyRunRate} per day`);
    expect(runRateRec?.dataExplanation).toContain(String(metrics.remainingRegistrations));

    const budgetRec = recommendations.find((r) => r.id === 'rec-budget-discipline');
    expect(budgetRec).toBeDefined();
    expect(budgetRec?.summary).toContain(`₹${metrics.budget.totalPlanned}`);
    expect(budgetRec?.summary).toContain(`₹${metrics.budget.totalActual}`);
  });

  it('safely handles edge case when campaign goal is reached (>= 500)', () => {
    const mockGoalMetMetrics = {
      totalTarget: 500,
      uniqueRegistrations: 510,
      remainingRegistrations: 0,
      progressPercentage: 100,
      totalCampaignDays: 7,
      currentCampaignDay: 6,
      remainingDays: 2,
      requiredDailyRunRate: 0,
      currentDailyAverage: 85,
      pacingStatus: 'AHEAD' as const,
      pacingDelta: 82,
      channels: [],
      dailyTrend: [],
      partnerLeaderboard: [],
      budget: {
        totalPlanned: 2000,
        totalActual: 0,
        remaining: 2000,
        percentSpent: 0,
        costPerRegistration: 0,
        categories: [],
      },
      unattributedCount: 10,
      unattributedPercentage: 1.9,
      duplicateAttemptsCount: 5,
      isDemoActive: true,
      demoRegistrationsCount: 510,
      realRegistrationsCount: 0,
    };

    const recs = generateRecommendations(mockGoalMetMetrics);
    const runRateRec = recs.find((r) => r.id === 'rec-run-rate');
    expect(runRateRec?.title).toContain('Target Achieved');
    expect(runRateRec?.metrics.find((m) => m.label === 'Status')?.value).toBe('GOAL COMPLETED');
  });

  it('safely handles edge case when remaining days is zero without division by zero', () => {
    const mockConcludedMetrics = {
      totalTarget: 500,
      uniqueRegistrations: 450,
      remainingRegistrations: 50,
      progressPercentage: 90,
      totalCampaignDays: 7,
      currentCampaignDay: 8, // day beyond campaign window
      remainingDays: 0,
      requiredDailyRunRate: 0,
      currentDailyAverage: 64.2,
      pacingStatus: 'BEHIND' as const,
      pacingDelta: -50,
      channels: [],
      dailyTrend: [],
      partnerLeaderboard: [],
      budget: {
        totalPlanned: 2000,
        totalActual: 0,
        remaining: 2000,
        percentSpent: 0,
        costPerRegistration: 0,
        categories: [],
      },
      unattributedCount: 15,
      unattributedPercentage: 3.3,
      duplicateAttemptsCount: 4,
      isDemoActive: true,
      demoRegistrationsCount: 450,
      realRegistrationsCount: 0,
    };

    const recs = generateRecommendations(mockConcludedMetrics);
    const runRateRec = recs.find((r) => r.id === 'rec-run-rate');
    expect(runRateRec?.title).toContain('Campaign Concluded');
    expect(runRateRec?.dataExplanation).toContain('Remaining days = 0');
    expect(runRateRec?.summary).not.toContain('NaN');
  });
});


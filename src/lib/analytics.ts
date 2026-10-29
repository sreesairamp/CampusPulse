import { prisma } from './prisma';
import { CAMPAIGN_TARGETS, CHANNELS, ChannelKey, BUDGET_ALLOCATIONS } from './constants';

export interface ChannelMetric {
  channelKey: ChannelKey;
  label: string;
  target: number;
  actual: number;
  percentage: number;
  color: string;
}

export interface DayRegistrationMetric {
  day: number;
  label: string;
  count: number;
  cumulative: number;
  targetPacing: number; // linear expected pace
}

export interface PartnerMetric {
  id: string;
  rank: number;
  name: string;
  college: string;
  referralCode: string;
  target: number;
  clicks: number;
  registrations: number;
  conversionRate: number; // percentage
  shareOfPartnerTarget: number; // percentage of 300
}

export interface BudgetOverview {
  totalPlanned: number;
  totalActual: number;
  remaining: number;
  percentSpent: number;
  costPerRegistration: number;
  categories: {
    name: string;
    planned: number;
    actual: number;
    remaining: number;
  }[];
}

export interface DashboardMetrics {
  totalTarget: number;
  uniqueRegistrations: number;
  remainingRegistrations: number;
  progressPercentage: number;
  totalCampaignDays: number;
  currentCampaignDay: number;
  remainingDays: number;
  requiredDailyRunRate: number;
  currentDailyAverage: number;
  pacingStatus: 'ON_TRACK' | 'AHEAD' | 'BEHIND';
  pacingDelta: number; // actual vs expected linear pace
  channels: ChannelMetric[];
  dailyTrend: DayRegistrationMetric[];
  partnerLeaderboard: PartnerMetric[];
  budget: BudgetOverview;
  unattributedCount: number;
  unattributedPercentage: number;
  duplicateAttemptsCount: number;
  isDemoActive: boolean;
  demoRegistrationsCount: number;
  realRegistrationsCount: number;
}

/**
 * Calculates complete campaign analytics from the database.
 */
export async function calculateCampaignMetrics(): Promise<DashboardMetrics> {
  // 1. Fetch registrations
  const allRegistrations = await prisma.registration.findMany({
    select: {
      id: true,
      channel: true,
      campaignDay: true,
      partnerId: true,
      isDemo: true,
    },
  });

  const duplicateAttemptsCount = await prisma.duplicateSubmission.count();

  const totalTarget = CAMPAIGN_TARGETS.TOTAL;
  const uniqueRegistrations = allRegistrations.length;
  const remainingRegistrations = Math.max(0, totalTarget - uniqueRegistrations);
  const progressPercentage = Math.min(100, Math.round((uniqueRegistrations / totalTarget) * 100));

  // Demo status
  const demoRegistrationsCount = allRegistrations.filter((r) => r.isDemo).length;
  const realRegistrationsCount = uniqueRegistrations - demoRegistrationsCount;
  const isDemoActive = demoRegistrationsCount > 0;

  // Campaign Meta / Timeline
  let meta = await prisma.campaignMeta.findUnique({
    where: { id: 'campuspulse_active_campaign' },
  });

  if (!meta) {
    meta = await prisma.campaignMeta.create({
      data: {
        id: 'campuspulse_active_campaign',
        targetTotal: 500,
        totalDays: 7,
        currentDay: 4,
      },
    });
  }

  const totalCampaignDays = meta.totalDays; // 7
  const currentCampaignDay = meta.currentDay; // e.g. Day 4
  const remainingDays = Math.max(0, totalCampaignDays - currentCampaignDay + 1);

  // Daily Run-rate required (safely handles zero remaining days)
  const requiredDailyRunRate =
    remainingDays > 0 ? Math.ceil(remainingRegistrations / remainingDays) : 0;
  const currentDailyAverage =
    currentCampaignDay > 0
      ? Number((uniqueRegistrations / currentCampaignDay).toFixed(1))
      : 0;

  // Expected pace at current day (linear benchmark)
  const linearExpectedAtCurrentDay = Math.round((totalTarget / totalCampaignDays) * currentCampaignDay);
  const pacingDelta = uniqueRegistrations - linearExpectedAtCurrentDay;
  const pacingStatus: 'ON_TRACK' | 'AHEAD' | 'BEHIND' =
    pacingDelta >= 15 ? 'AHEAD' : pacingDelta >= -15 ? 'ON_TRACK' : 'BEHIND';

  // 2. Channel Breakdown
  const channelCounts: Record<string, number> = {
    CAMPUS_PARTNER: 0,
    STUDENT_REFERRAL: 0,
    COLLEGE_COMMUNITIES: 0,
    TARGETED_EMAIL: 0,
    DIRECT: 0,
  };

  for (const reg of allRegistrations) {
    if (channelCounts[reg.channel] !== undefined) {
      channelCounts[reg.channel]++;
    } else {
      channelCounts.DIRECT++;
    }
  }

  const channels: ChannelMetric[] = [
    {
      channelKey: 'CAMPUS_PARTNER',
      label: CHANNELS.CAMPUS_PARTNER.label,
      target: CHANNELS.CAMPUS_PARTNER.target,
      actual: channelCounts.CAMPUS_PARTNER,
      percentage: Math.round((channelCounts.CAMPUS_PARTNER / CHANNELS.CAMPUS_PARTNER.target) * 100),
      color: CHANNELS.CAMPUS_PARTNER.color,
    },
    {
      channelKey: 'STUDENT_REFERRAL',
      label: CHANNELS.STUDENT_REFERRAL.label,
      target: CHANNELS.STUDENT_REFERRAL.target,
      actual: channelCounts.STUDENT_REFERRAL,
      percentage: Math.round((channelCounts.STUDENT_REFERRAL / CHANNELS.STUDENT_REFERRAL.target) * 100),
      color: CHANNELS.STUDENT_REFERRAL.color,
    },
    {
      channelKey: 'COLLEGE_COMMUNITIES',
      label: CHANNELS.COLLEGE_COMMUNITIES.label,
      target: CHANNELS.COLLEGE_COMMUNITIES.target,
      actual: channelCounts.COLLEGE_COMMUNITIES,
      percentage: Math.round((channelCounts.COLLEGE_COMMUNITIES / CHANNELS.COLLEGE_COMMUNITIES.target) * 100),
      color: CHANNELS.COLLEGE_COMMUNITIES.color,
    },
    {
      channelKey: 'TARGETED_EMAIL',
      label: CHANNELS.TARGETED_EMAIL.label,
      target: CHANNELS.TARGETED_EMAIL.target,
      actual: channelCounts.TARGETED_EMAIL,
      percentage: Math.round((channelCounts.TARGETED_EMAIL / CHANNELS.TARGETED_EMAIL.target) * 100),
      color: CHANNELS.TARGETED_EMAIL.color,
    },
    {
      channelKey: 'DIRECT',
      label: CHANNELS.DIRECT.label,
      target: CHANNELS.DIRECT.target,
      actual: channelCounts.DIRECT,
      percentage: 0,
      color: CHANNELS.DIRECT.color,
    },
  ];

  const unattributedCount = channelCounts.DIRECT;
  const unattributedPercentage =
    uniqueRegistrations > 0
      ? Number(((unattributedCount / uniqueRegistrations) * 100).toFixed(1))
      : 0;

  // 3. Daily Registration Trend (Day 1 to 7)
  const dailyDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  for (const reg of allRegistrations) {
    const day = Math.min(Math.max(1, reg.campaignDay), 7);
    dailyDistribution[day] = (dailyDistribution[day] || 0) + 1;
  }

  let runningCumulative = 0;
  const dailyTrend: DayRegistrationMetric[] = [];
  for (let day = 1; day <= totalCampaignDays; day++) {
    const count = dailyDistribution[day] || 0;
    runningCumulative += count;
    dailyTrend.push({
      day,
      label: `Day ${day}`,
      count,
      cumulative: runningCumulative,
      targetPacing: Math.round((totalTarget / totalCampaignDays) * day),
    });
  }

  // 4. Campus Partner Leaderboard
  const partners = await prisma.campusPartner.findMany({
    include: {
      registrations: {
        select: { id: true },
      },
    },
  });

  const partnerLeaderboard: PartnerMetric[] = partners
    .map((p) => {
      const registrations = p.registrations.length;
      const clicks = Math.max(registrations, p.clicks);
      const conversionRate = clicks > 0 ? Number(((registrations / clicks) * 100).toFixed(1)) : 0;
      const shareOfPartnerTarget = Number(
        ((registrations / CAMPAIGN_TARGETS.CAMPUS_PARTNERS) * 100).toFixed(1)
      );
      return {
        id: p.id,
        rank: 0,
        name: p.name,
        college: p.college,
        referralCode: p.referralCode,
        target: p.targetRegistrations,
        clicks,
        registrations,
        conversionRate,
        shareOfPartnerTarget,
      };
    })
    .sort((a, b) => b.registrations - a.registrations)
    .map((partner, index) => ({
      ...partner,
      rank: index + 1,
    }));

  // 5. Budget overview (Planned vs Actual)
  const expenses = await prisma.expense.findMany();
  let actualCreative = 0;
  let actualPromotion = 0;
  let actualContingency = 0;

  for (const exp of expenses) {
    if (exp.category === 'CREATIVE') actualCreative += exp.amount;
    else if (exp.category === 'TARGETED_PROMOTION') actualPromotion += exp.amount;
    else actualContingency += exp.amount;
  }

  const totalActual = actualCreative + actualPromotion + actualContingency;
  const totalPlanned = BUDGET_ALLOCATIONS.TOTAL;
  const remainingBudget = Math.max(0, totalPlanned - totalActual);
  const percentSpent = Number(((totalActual / totalPlanned) * 100).toFixed(1));
  const costPerRegistration =
    uniqueRegistrations > 0 ? Number((totalActual / uniqueRegistrations).toFixed(2)) : 0;

  const budget: BudgetOverview = {
    totalPlanned,
    totalActual,
    remaining: remainingBudget,
    percentSpent,
    costPerRegistration,
    categories: [
      {
        name: 'Creative Assets (Poster/Flyer)',
        planned: BUDGET_ALLOCATIONS.CREATIVE,
        actual: actualCreative,
        remaining: Math.max(0, BUDGET_ALLOCATIONS.CREATIVE - actualCreative),
      },
      {
        name: 'Optional Targeted Promotion',
        planned: BUDGET_ALLOCATIONS.TARGETED_PROMOTION,
        actual: actualPromotion,
        remaining: Math.max(0, BUDGET_ALLOCATIONS.TARGETED_PROMOTION - actualPromotion),
      },
      {
        name: 'Contingency Reserve',
        planned: BUDGET_ALLOCATIONS.CONTINGENCY,
        actual: actualContingency,
        remaining: Math.max(0, BUDGET_ALLOCATIONS.CONTINGENCY - actualContingency),
      },
    ],
  };

  return {
    totalTarget,
    uniqueRegistrations,
    remainingRegistrations,
    progressPercentage,
    totalCampaignDays,
    currentCampaignDay,
    remainingDays,
    requiredDailyRunRate,
    currentDailyAverage,
    pacingStatus,
    pacingDelta,
    channels,
    dailyTrend,
    partnerLeaderboard,
    budget,
    unattributedCount,
    unattributedPercentage,
    duplicateAttemptsCount,
    isDemoActive,
    demoRegistrationsCount,
    realRegistrationsCount,
  };
}


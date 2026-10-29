import { DashboardMetrics } from './analytics';

export interface ActionRecommendation {
  id: string;
  category: 'PACING' | 'CHANNEL' | 'PARTNER' | 'OPERATIONS' | 'BUDGET';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  summary: string;
  dataExplanation: string;
  actionSteps: string[];
  metrics: {
    label: string;
    value: string | number;
  }[];
}

/**
 * Deterministic Action Recommendation Engine.
 * Evaluates real campaign metrics and produces transparent, mathematically grounded operational actions.
 */
export function generateRecommendations(metrics: DashboardMetrics): ActionRecommendation[] {
  const recommendations: ActionRecommendation[] = [];

  const {
    uniqueRegistrations,
    totalTarget,
    remainingRegistrations,
    currentCampaignDay,
    totalCampaignDays,
    remainingDays,
    requiredDailyRunRate,
    currentDailyAverage,
    pacingStatus,
    channels,
    partnerLeaderboard,
    budget,
    unattributedCount,
    unattributedPercentage,
  } = metrics;

  // 1. Pacing & Run-rate Recommendation
  const currentVelocity = currentDailyAverage;
  const isPacingBehind = pacingStatus === 'BEHIND';
  const isTargetAchieved = uniqueRegistrations >= totalTarget;
  const isCampaignConcluded = remainingDays <= 0;

  if (isTargetAchieved) {
    recommendations.push({
      id: 'rec-run-rate',
      category: 'PACING',
      priority: 'INFO',
      title: 'Target Achieved: 500 registrations milestone reached!',
      summary: `The campaign goal of 500 engineering students has been successfully attained (${uniqueRegistrations}/${totalTarget}). Focus on workshop operations and reminder messaging.`,
      dataExplanation: `Mathematical basis: Unique registrations (${uniqueRegistrations}) meets or exceeds the campaign goal (${totalTarget}). Remaining deficit = 0.`,
      actionSteps: [
        'Shift focus to workshop logistics: verify Discord/Zoom/Stream server capacities for 500+ attendees.',
        'Trigger automated pre-workshop confirmation reminders to registered students.',
        'Distribute GitHub starter repository instructions 24 hours prior to the live session.',
      ],
      metrics: [
        { label: 'Total Registrations', value: uniqueRegistrations },
        { label: 'Target Milestone', value: totalTarget },
        { label: 'Achievement', value: '100%+' },
        { label: 'Status', value: 'GOAL COMPLETED' },
      ],
    });
  } else if (isCampaignConcluded) {
    recommendations.push({
      id: 'rec-run-rate',
      category: 'PACING',
      priority: 'HIGH',
      title: `Campaign Concluded: ${uniqueRegistrations} registrations finalized`,
      summary: `The 7-day registration window has concluded with ${uniqueRegistrations} registered students (${Math.round((uniqueRegistrations / totalTarget) * 100)}% of goal).`,
      dataExplanation: `Mathematical basis: Campaign days elapsed (7/7). Remaining days = 0. Shortfall = ${remainingRegistrations} students.`,
      actionSteps: [
        'Compile final campaign retrospective report across all 5 acquisition channels.',
        'Identify top-converting campus leads for future university roadshows.',
      ],
      metrics: [
        { label: 'Final Registrations', value: uniqueRegistrations },
        { label: 'Goal Target', value: totalTarget },
        { label: 'Remaining Days', value: 0 },
        { label: 'Status', value: 'CONCLUDED' },
      ],
    });
  } else {
    const mostRecentDay = metrics.dailyTrend.find((d) => d.day === currentCampaignDay);
    const mostRecentDayCount = mostRecentDay ? mostRecentDay.count : 0;
    const isPacingAhead = currentVelocity >= requiredDailyRunRate;
    const velocityDifference = Math.abs(currentVelocity - requiredDailyRunRate);

    let title = '';
    let summary = '';

    if (isPacingAhead) {
      title = `Target Velocity: Need ${requiredDailyRunRate} registrations/day to reach 500 (Pacing Ahead)`;
      summary = `At ${uniqueRegistrations} registrations on Day ${currentCampaignDay}, with ${remainingDays} days remaining (Days ${currentCampaignDay}–${totalCampaignDays}), ${remainingRegistrations} registrations are needed, or ${requiredDailyRunRate} per day rounded up (⌈${remainingRegistrations}/${remainingDays}⌉ = ${requiredDailyRunRate}). With an elapsed ${currentCampaignDay}-day cumulative average pace of ${currentVelocity.toFixed(1)}/day (${uniqueRegistrations}/${currentCampaignDay}), the campaign is currently ahead of the required average pace (+${velocityDifference.toFixed(1)}/day surplus). However, sustained performance is not guaranteed as link saturation or weekend fatigue can dampen conversion. Note that this ${currentVelocity.toFixed(1)}/day figure represents the cumulative average pace across elapsed days, distinct from Day ${currentCampaignDay}'s single-day volume (+${mostRecentDayCount} registrations).`;
    } else {
      title = `Target Velocity: Need ${requiredDailyRunRate} registrations/day to reach 500`;
      summary = `At ${uniqueRegistrations} registrations on Day ${currentCampaignDay}, with ${remainingDays} days remaining (Days ${currentCampaignDay}–${totalCampaignDays}), ${remainingRegistrations} registrations are needed, or ${requiredDailyRunRate} per day rounded up. Current cumulative average pace of ${currentVelocity.toFixed(1)}/day is behind the required velocity of ${requiredDailyRunRate}/day. An acceleration of +${velocityDifference.toFixed(1)} registrations/day is needed across the remaining ${remainingDays} days. Note that this cumulative average pace across elapsed days is distinct from Day ${currentCampaignDay}'s single-day volume (+${mostRecentDayCount} registrations).`;
    }

    recommendations.push({
      id: 'rec-run-rate',
      category: 'PACING',
      priority: isPacingBehind ? 'CRITICAL' : 'HIGH',
      title,
      summary,
      dataExplanation: `Mathematical basis: Remaining target = (${totalTarget} goal - ${uniqueRegistrations} acquired) = ${remainingRegistrations} registrations. Divided across ${remainingDays} remaining campaign days (Day ${currentCampaignDay} to ${totalCampaignDays}) = ${requiredDailyRunRate} registrations/day rounded up (ceil(${remainingRegistrations}/${remainingDays}) = ${requiredDailyRunRate}/day). Cumulative average velocity across ${currentCampaignDay} elapsed days is ${currentVelocity.toFixed(1)}/day (${uniqueRegistrations}/${currentCampaignDay}), compared to Day ${currentCampaignDay}'s single-day volume of +${mostRecentDayCount} registrations.`,
      actionSteps: [
        `Distribute the ${requiredDailyRunRate}/day target: assign ~${Math.ceil(requiredDailyRunRate * 0.6)}/day to Campus Partners and ~${Math.ceil(requiredDailyRunRate * 0.2)}/day to Student Referrals.`,
        `Schedule daily 10:00 AM check-ins with campus leads to review yesterday's count.`,
        `Release Day 5 midday reminders for pre-final and final-year student groups.`,
      ],
      metrics: [
        { label: 'Current Registrations', value: uniqueRegistrations },
        { label: 'Remaining Target', value: remainingRegistrations },
        { label: 'Days Remaining', value: remainingDays },
        { label: 'Required Daily Pace', value: `${requiredDailyRunRate} / day` },
        { label: `${currentCampaignDay}-Day Average Pace`, value: `${currentVelocity.toFixed(1)} / day` },
        { label: `Day ${currentCampaignDay} Inflow`, value: `+${mostRecentDayCount}` },
      ],
    });
  }

  // 2. Channel Gap Analysis
  const campaignProgressRatio = currentCampaignDay / totalCampaignDays;
  const laggingChannels = channels.filter((c) => {
    if (c.target === 0) return false;
    const channelRatio = c.actual / c.target;
    return channelRatio < campaignProgressRatio * 0.85; // more than 15% behind pacing
  });

  if (laggingChannels.length > 0) {
    const primaryLagging = laggingChannels[0];
    const expectedAtCurrentDay = Math.round(primaryLagging.target * campaignProgressRatio);
    const channelDeficit = expectedAtCurrentDay - primaryLagging.actual;

    recommendations.push({
      id: 'rec-channel-gap',
      category: 'CHANNEL',
      priority: 'HIGH',
      title: `${primaryLagging.label} channel lagging behind timeline pace`,
      summary: `${primaryLagging.label} has delivered ${primaryLagging.actual} of ${primaryLagging.target} quota (${primaryLagging.percentage}% channel target achievement). At Day ${currentCampaignDay} of ${totalCampaignDays}, linear expectation was ${expectedAtCurrentDay} (${channelDeficit} shortfall).`,
      dataExplanation: `Calculation: Channel target quota (${primaryLagging.target}) × Campaign elapsed ratio (${(campaignProgressRatio * 100).toFixed(1)}%) = ${expectedAtCurrentDay} expected registrations. Actual registered = ${primaryLagging.actual}. Deficit = ${channelDeficit} registrations. Note: Channel target achievement measures progress toward quota, distinct from link click-to-registration conversion rate.`,
      actionSteps: [
        `Re-engage inactive or low-producing campus leads with pre-written WhatsApp broadcast assets.`,
        `Host a 15-minute sync with college club leads to post announcements in batch departmental Discord/WhatsApp communities.`,
        `Trigger the secondary outreach sequence for students who clicked referral links but haven't completed registration.`,
      ],
      metrics: [
        { label: 'Channel Target Quota', value: primaryLagging.target },
        { label: 'Actual Registrations', value: primaryLagging.actual },
        { label: 'Current Shortfall', value: `${channelDeficit} students` },
        { label: 'Target Achievement %', value: `${primaryLagging.percentage}%` },
      ],
    });
  }

  // 3. Strongest Channel Focus & Amplification
  const activeChannels = channels.filter((c) => c.target > 0);
  const strongestChannel = [...activeChannels].sort((a, b) => b.percentage - a.percentage)[0];

  if (strongestChannel && strongestChannel.actual > 10) {
    recommendations.push({
      id: 'rec-strongest-channel',
      category: 'CHANNEL',
      priority: 'MEDIUM',
      title: `Double down on strongest performer: ${strongestChannel.label}`,
      summary: `${strongestChannel.label} is your top acquisition channel by quota completion, achieving ${strongestChannel.percentage}% channel target achievement (${strongestChannel.actual}/${strongestChannel.target} quota).`,
      dataExplanation: `Comparison metric: ${strongestChannel.label} has converted ${strongestChannel.actual} students against its ${strongestChannel.target} quota (${strongestChannel.percentage}% target achievement), pacing ahead of all other acquisition streams.`,
      actionSteps: [
        `Provide additional incentives or special recognition to top contributors in this channel.`,
        `Analyze which message templates yielded the highest click-to-register conversions and replicate that copy in lagging channels.`,
        `Prompt recently registered students in this channel to invite 2 engineering project group partners.`,
      ],
      metrics: [
        { label: 'Top Channel', value: strongestChannel.label },
        { label: 'Registrations', value: strongestChannel.actual },
        { label: 'Target Achievement %', value: `${strongestChannel.percentage}%` },
      ],
    });
  }

  // 4. Mid-Campaign Review Alert (Days 3 to 5)
  if (currentCampaignDay >= 3 && currentCampaignDay <= 5) {
    recommendations.push({
      id: 'rec-mid-campaign-review',
      category: 'OPERATIONS',
      priority: isPacingBehind ? 'CRITICAL' : 'MEDIUM',
      title: 'Conduct Mid-Campaign Operational Review',
      summary: `Day ${currentCampaignDay} is the campaign midpoint. Now is the ideal window to reallocate focus, inspect referral funnels, and unblock underperforming partners.`,
      dataExplanation: `Milestone trigger: Campaign is at Day ${currentCampaignDay} of ${totalCampaignDays} (${Math.round(campaignProgressRatio * 100)}% elapsed). Historical conversion drop-off occurs if momentum is not refreshed between Day 4 and Day 6.`,
      actionSteps: [
        `Review individual partner conversion rates: audit partners with >20 clicks but <5 registrations.`,
        `Send personalized voice notes or follow-up messages to department class representatives.`,
        `Verify zero technical registration drops or mobile form responsiveness issues.`,
      ],
      metrics: [
        { label: 'Campaign Day', value: `${currentCampaignDay} / ${totalCampaignDays}` },
        { label: 'Pacing Status', value: pacingStatus },
        { label: 'Days Remaining', value: remainingDays },
      ],
    });
  }

  // 5. Campus Partner Leaderboard Insights
  if (partnerLeaderboard.length > 0) {
    const topPartner = partnerLeaderboard[0];
    const underperformingPartners = partnerLeaderboard.filter((p) => p.registrations < 10);

    if (topPartner && topPartner.registrations > 0) {
      recommendations.push({
        id: 'rec-partner-leader',
        category: 'PARTNER',
        priority: 'MEDIUM',
        title: `Leverage top partner playbook: ${topPartner.name} (${topPartner.college})`,
        summary: `${topPartner.name} leads the ambassador network with ${topPartner.registrations} registrations from ${topPartner.clicks} link clicks (${topPartner.conversionRate}% click-to-registration conversion rate), accounting for ${topPartner.shareOfPartnerTarget}% of the 300 campus partner quota.`,
        dataExplanation: `Partner performance data: ${topPartner.clicks} link clicks generated → ${topPartner.registrations} confirmed unique registrations = ${topPartner.conversionRate}% click-to-registration conversion rate. Quota contribution = ${topPartner.shareOfPartnerTarget}% of the 300-student campus partner goal. Note: Click-to-registration conversion measures traffic quality, distinct from channel quota achievement.`,
        actionSteps: [
          `Interview ${topPartner.name} on their promotion method (college WhatsApp group vs lab announcement vs direct DM) and share the exact workflow with other campus partners.`,
          `Activate ${underperformingPartners.length} lagging campus partners with ${topPartner.name}'s outreach message template.`,
        ],
        metrics: [
          { label: 'Lead Partner', value: topPartner.name },
          { label: 'Registrations', value: topPartner.registrations },
          { label: 'Click-to-Reg Conversion', value: `${topPartner.conversionRate}%` },
          { label: 'Share of 300 Goal', value: `${topPartner.shareOfPartnerTarget}%` },
        ],
      });
    }
  }

  // 6. Direct / Unattributed Traffic Audit
  if (unattributedPercentage > 8) {
    recommendations.push({
      id: 'rec-unattributed-audit',
      category: 'OPERATIONS',
      priority: 'MEDIUM',
      title: `Audit Direct / Unattributed registrations (${unattributedPercentage}%)`,
      summary: `${unattributedCount} registrations (${unattributedPercentage}%) entered without a referral code or source tag. This indicates organic word-of-mouth or lost UTM parameters.`,
      dataExplanation: `Attribution data: ${unattributedCount} registrations have channel = 'DIRECT' out of ${uniqueRegistrations} total unique registrations. While strict separation prevents guessing, reducing untracked shares improves accountability.`,
      actionSteps: [
        `Ensure all shared links in partner assets have the ?ref= query parameter appended.`,
        `Remind campus leads to share their full custom link rather than naked URLs.`,
      ],
      metrics: [
        { label: 'Unattributed Count', value: unattributedCount },
        { label: 'Share of Total', value: `${unattributedPercentage}%` },
      ],
    });
  }

  // 7. Budget Discipline
  recommendations.push({
    id: 'rec-budget-discipline',
    category: 'BUDGET',
    priority: 'INFO',
    title: `Budget status: ₹${budget.totalActual} spent of ₹${budget.totalPlanned} planned`,
    summary: `₹${budget.remaining} remaining in total budget of ₹${budget.totalPlanned} planned (₹${budget.totalActual} spent). Planned allocation covers Creative (₹300), Targeted Promotion (₹1,200), and Contingency (₹500). Maintain strict cost discipline.`,
    dataExplanation: `Budget formula: Planned cap ₹${budget.totalPlanned} - Verified actual spend ₹${budget.totalActual} = ₹${budget.remaining} remaining. Cost per acquired student is ₹${budget.costPerRegistration} (planned cap: ₹4.00/student).`,
    actionSteps: [
      `Keep paid promotions on hold until Day 5: evaluate organic partner pacing first before dipping into the ₹1,200 promotion budget.`,
      `Log any actual creative or promotion expenditure with itemized descriptions.`,
    ],
    metrics: [
      { label: 'Planned Budget', value: `₹${budget.totalPlanned}` },
      { label: 'Actual Spend', value: `₹${budget.totalActual}` },
      { label: 'Remaining Reserve', value: `₹${budget.remaining}` },
      { label: 'Cost / Registration', value: `₹${budget.costPerRegistration}` },
    ],
  });

  return recommendations;
}


import { DashboardMetrics } from './analytics';

export interface CsvRegistrationRow {
  id: string;
  fullName: string;
  email: string;
  college: string;
  graduationYear: string;
  branch: string;
  channel: string;
  referralCode?: string | null;
  campaignDay: number;
  isDemo: boolean;
  createdAt: Date | string;
}

/**
 * Escapes individual CSV cell to prevent formula injection and handle commas/newlines/quotes.
 * Mitigates CSV Injection (OWASP) by prefixing cells starting with =, +, -, @ with a single quote.
 */
export function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);
  // CSV Formula Injection mitigation
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape internal double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Generates RFC 4180 compliant CSV string from an array of registration records.
 * For authorized growth operators only.
 */
export function generateRegistrationsCsv(records: CsvRegistrationRow[]): string {
  const headers = [
    'Registration ID',
    'Full Name',
    'Email Address',
    'College / University',
    'Graduation Year',
    'Engineering Branch',
    'Acquisition Channel',
    'Referral Code Used',
    'Campaign Day',
    'Record Type',
    'Registered At (UTC)',
  ];

  const rows = records.map((record) => {
    return [
      escapeCsvCell(record.id),
      escapeCsvCell(record.fullName),
      escapeCsvCell(record.email),
      escapeCsvCell(record.college),
      escapeCsvCell(record.graduationYear),
      escapeCsvCell(record.branch),
      escapeCsvCell(record.channel),
      escapeCsvCell(record.referralCode || 'N/A'),
      escapeCsvCell(`Day ${record.campaignDay}`),
      escapeCsvCell(record.isDemo ? 'Demo Simulation' : 'Live Registration'),
      escapeCsvCell(
        typeof record.createdAt === 'string'
          ? record.createdAt
          : record.createdAt.toISOString()
      ),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates an Anonymized Campaign Performance Summary CSV.
 * Safe for public distribution: Contains zero student PII (no names, emails, or personal identifiers).
 */
export function generateAnonymizedSummaryCsv(metrics: DashboardMetrics): string {
  const lines: string[] = [];

  // Header Section
  lines.push('CAMPUSPULSE GROWTH CAMPAIGN SUMMARY');
  lines.push(`Generated At,${escapeCsvCell(new Date().toISOString())}`);
  lines.push(`Campaign Status,${escapeCsvCell(`Day ${metrics.currentCampaignDay} of ${metrics.totalCampaignDays}`)}`);
  lines.push(`Total Target,${escapeCsvCell(metrics.totalTarget)}`);
  lines.push(`Total Unique Registrations,${escapeCsvCell(metrics.uniqueRegistrations)}`);
  lines.push(`Remaining Registrations,${escapeCsvCell(metrics.remainingRegistrations)}`);
  lines.push(`Progress Percentage,${escapeCsvCell(`${metrics.progressPercentage}%`)}`);
  lines.push(`Required Daily Run-Rate,${escapeCsvCell(`${metrics.requiredDailyRunRate}/day`)}`);
  lines.push('');

  // Channel Breakdown Table
  lines.push('ACQUISITION CHANNELS PERFORMANCE');
  lines.push('Channel Key,Channel Label,Target Quota,Actual Acquired,Achievement %,Contribution %');
  for (const ch of metrics.channels) {
    const contribution =
      metrics.uniqueRegistrations > 0
        ? ((ch.actual / metrics.uniqueRegistrations) * 100).toFixed(1)
        : '0.0';
    lines.push(
      [
        escapeCsvCell(ch.channelKey),
        escapeCsvCell(ch.label),
        escapeCsvCell(ch.target),
        escapeCsvCell(ch.actual),
        escapeCsvCell(`${ch.percentage}%`),
        escapeCsvCell(`${contribution}%`),
      ].join(',')
    );
  }
  lines.push('');

  // Budget Breakdown Table
  lines.push('BUDGET & FINANCIAL CONTROLS');
  lines.push('Category,Planned Cap (INR),Verified Actual Spend (INR),Remaining Reserve (INR)');
  for (const b of metrics.budget.categories) {
    lines.push(
      [
        escapeCsvCell(b.name),
        escapeCsvCell(b.planned),
        escapeCsvCell(b.actual),
        escapeCsvCell(b.remaining),
      ].join(',')
    );
  }
  lines.push(
    `TOTAL,${escapeCsvCell(metrics.budget.totalPlanned)},${escapeCsvCell(metrics.budget.totalActual)},${escapeCsvCell(metrics.budget.remaining)}`
  );
  lines.push('');

  // Campus Partner Aggregates Table (No personal emails or student lists)
  lines.push('CAMPUS PARTNER AGGREGATE LEADERBOARD');
  lines.push('Rank,Partner Name,College,Referral Code,Clicks,Registrations,Conversion Rate %,Share of Partner Goal %');
  for (const p of metrics.partnerLeaderboard) {
    lines.push(
      [
        escapeCsvCell(p.rank),
        escapeCsvCell(p.name),
        escapeCsvCell(p.college),
        escapeCsvCell(p.referralCode),
        escapeCsvCell(p.clicks),
        escapeCsvCell(p.registrations),
        escapeCsvCell(`${p.conversionRate}%`),
        escapeCsvCell(`${p.shareOfPartnerTarget}%`),
      ].join(',')
    );
  }

  return lines.join('\r\n');
}

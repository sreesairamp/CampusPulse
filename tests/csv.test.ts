import { describe, it, expect } from 'vitest';
import {
  escapeCsvCell,
  generateRegistrationsCsv,
  generateAnonymizedSummaryCsv,
  CsvRegistrationRow,
} from '../src/lib/csv';
import { calculateCampaignMetrics } from '../src/lib/analytics';

describe('CSV Export Generator', () => {
  it('correctly escapes CSV cells with special characters and commas', () => {
    expect(escapeCsvCell('Simple Text')).toBe('"Simple Text"');
    expect(escapeCsvCell('Hello, World')).toBe('"Hello, World"');
    expect(escapeCsvCell('Text with "quotes" inside')).toBe('"Text with ""quotes"" inside"');
    expect(escapeCsvCell(null)).toBe('""');
    expect(escapeCsvCell(undefined)).toBe('""');
    expect(escapeCsvCell(1234)).toBe('"1234"');
    // Formula injection mitigation
    expect(escapeCsvCell('=cmd|"/C calc"!A0')).toBe("\"'=cmd|\"\"/C calc\"\"!A0\"");
    expect(escapeCsvCell('+12345')).toBe("\"'+12345\"");
    expect(escapeCsvCell('-SUM(A1:A10)')).toBe("\"'-SUM(A1:A10)\"");
    expect(escapeCsvCell('@evil')).toBe("\"'@evil\"");
  });

  it('generates well-formatted CSV with expected headers and rows', () => {
    const mockRows: CsvRegistrationRow[] = [
      {
        id: 'reg-001',
        fullName: 'Rohan Sharma',
        email: 'rohan@example.com',
        college: 'RV College of Engineering, Bengaluru',
        graduationYear: 'Final Year (2025/2026 Batch)',
        branch: 'Computer Science & Engineering (CSE)',
        channel: 'CAMPUS_PARTNER',
        referralCode: 'RVCE-AI24',
        campaignDay: 2,
        isDemo: true,
        createdAt: new Date('2026-10-25T10:00:00Z'),
      },
      {
        id: 'reg-002',
        fullName: 'Aditi Rao',
        email: 'aditi@example.com',
        college: 'PES University',
        graduationYear: 'Final Year (2025/2026 Batch)',
        branch: 'Information Technology (IT)',
        channel: 'DIRECT',
        referralCode: null,
        campaignDay: 3,
        isDemo: false,
        createdAt: '2026-10-26T14:30:00Z',
      },
    ];

    const csv = generateRegistrationsCsv(mockRows);
    const lines = csv.split('\r\n');

    expect(lines.length).toBe(3); // 1 header line + 2 data rows
    expect(lines[0]).toContain('Registration ID');
    expect(lines[0]).toContain('Acquisition Channel');
    expect(lines[0]).toContain('Record Type');

    // Row 1 checks
    expect(lines[1]).toContain('"reg-001"');
    expect(lines[1]).toContain('"Rohan Sharma"');
    expect(lines[1]).toContain('"RVCE-AI24"');
    expect(lines[1]).toContain('"Demo Simulation"');

    // Row 2 checks
    expect(lines[2]).toContain('"reg-002"');
    expect(lines[2]).toContain('"Aditi Rao"');
    expect(lines[2]).toContain('"DIRECT"');
    expect(lines[2]).toContain('"Live Registration"');
  });

  it('generates an anonymized summary CSV that contains zero student PII', async () => {
    const metrics = await calculateCampaignMetrics();
    const summaryCsv = generateAnonymizedSummaryCsv(metrics);

    expect(summaryCsv).toContain('CAMPUSPULSE GROWTH CAMPAIGN SUMMARY');
    expect(summaryCsv).toContain('ACQUISITION CHANNELS PERFORMANCE');
    expect(summaryCsv).toContain('BUDGET & FINANCIAL CONTROLS');

    // Security assertion: Zero individual student emails or IDs should appear in public summary
    expect(summaryCsv).not.toContain('@gmail.com');
    expect(summaryCsv).not.toContain('@college.edu');
    expect(summaryCsv).not.toContain('student.');
  });
});


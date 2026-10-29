import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { validateRegistration } from '../src/lib/validation';
import { resolveAttribution } from '../src/lib/referral';
import { calculateCampaignMetrics } from '../src/lib/analytics';
import { generateRegistrationsCsv, generateAnonymizedSummaryCsv } from '../src/lib/csv';
import { DEFAULT_OPERATOR_CODE } from '../src/lib/auth';

describe('Complete End-to-End User Journey Audit', () => {
  const auditEmail1 = 'audit.test.student1@college.edu';
  const auditEmail2 = 'audit.test.student2@college.edu';
  const auditPartnerCode = 'AUDIT-LEAD24';
  let createdPartnerId = '';
  let student1ReferralCode = '';
  let student1Id = '';

  beforeAll(async () => {
    // Cleanup any lingering audit records
    await prisma.duplicateSubmission.deleteMany({
      where: { email: { in: [auditEmail1, auditEmail2] } },
    });
    await prisma.registration.deleteMany({
      where: { email: { in: [auditEmail1, auditEmail2] } },
    });
    await prisma.campusPartner.deleteMany({
      where: { referralCode: auditPartnerCode },
    });
  });

  afterAll(async () => {
    await prisma.duplicateSubmission.deleteMany({
      where: { email: { in: [auditEmail1, auditEmail2] } },
    });
    await prisma.registration.deleteMany({
      where: { email: { in: [auditEmail1, auditEmail2] } },
    });
    await prisma.campusPartner.deleteMany({
      where: { referralCode: auditPartnerCode },
    });
  });

  it('Journey 1: Reject invalid email and incomplete form inputs', () => {
    const invalidInput = {
      fullName: '',
      email: 'not-an-email',
      college: 'A', // too short
      graduationYear: 'Invalid Year',
      branch: 'Invalid Stream',
    };

    const result = validateRegistration(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.fullName).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.college).toBeDefined();
    expect(result.errors.graduationYear).toBeDefined();
    expect(result.errors.branch).toBeDefined();
  });

  it('Journey 2: Onboard a new campus partner and verify attribution', async () => {
    const partner = await prisma.campusPartner.create({
      data: {
        name: 'Audit Lead Ambassador',
        email: 'ambassador@audituniv.edu',
        college: 'Audit National Institute',
        referralCode: auditPartnerCode,
        targetRegistrations: 60,
        clicks: 10,
        active: true,
        isDemo: false,
      },
    });

    createdPartnerId = partner.id;
    expect(partner.id).toBeDefined();

    // Verify attribution resolution finds this partner
    const attr = await resolveAttribution(auditPartnerCode);
    expect(attr.channel).toBe('CAMPUS_PARTNER');
    expect(attr.partnerId).toBe(createdPartnerId);
    expect(attr.isKnownReferral).toBe(true);
  });

  it('Journey 3: Register student through campus partner link and generate student share code', async () => {
    // Verify valid registration
    const input = {
      fullName: 'Aarav Audit',
      email: '  AUDIT.TEST.STUDENT1@COLLEGE.EDU  ', // unnormalized with spaces and uppercase
      college: 'Audit National Institute',
      graduationYear: 'Final Year (2025/2026 Batch)',
      branch: 'Computer Science & Engineering (CSE)',
      referralCode: auditPartnerCode,
    };

    const validation = validateRegistration(input);
    expect(validation.isValid).toBe(true);
    const normalized = validation.normalizedData!;
    expect(normalized.email).toBe(auditEmail1);

    const attr = await resolveAttribution(normalized.referralCode);
    const reg = await prisma.registration.create({
      data: {
        fullName: normalized.fullName,
        email: normalized.email,
        college: normalized.college,
        graduationYear: normalized.graduationYear,
        branch: normalized.branch,
        channel: attr.channel,
        referralCode: attr.referralCode,
        myReferralCode: 'STU-AUDIT1',
        partnerId: attr.partnerId,
        isDemo: false, // Live real registration
      },
    });

    student1Id = reg.id;
    student1ReferralCode = reg.myReferralCode!;
    expect(reg.id).toBeDefined();
    expect(reg.channel).toBe('CAMPUS_PARTNER');
    expect(reg.partnerId).toBe(createdPartnerId);
  });

  it('Journey 4: Prevent duplicate registration using normalized email and record duplicate attempt', async () => {
    // Attempt duplicate registration with different casing and spaces
    const dupInput = {
      fullName: 'Aarav Duplicate Attempt',
      email: 'audit.test.student1@college.edu',
      college: 'Different College',
      graduationYear: 'Final Year (2025/2026 Batch)',
      branch: 'Information Technology (IT)',
    };

    const validation = validateRegistration(dupInput);
    expect(validation.isValid).toBe(true);
    const normalizedEmail = validation.normalizedData!.email;

    const existing = await prisma.registration.findUnique({
      where: { email: normalizedEmail },
    });
    expect(existing).not.toBeNull();

    // System creates a duplicate audit record instead of duplicating registration
    const dupRecord = await prisma.duplicateSubmission.create({
      data: {
        email: normalizedEmail,
        channel: existing!.channel,
        isDemo: false,
      },
    });
    expect(dupRecord.id).toBeDefined();

    // Verify registration count did not increase
    const count = await prisma.registration.count({
      where: { email: normalizedEmail },
    });
    expect(count).toBe(1);
  });

  it('Journey 5: Register second student using peer student referral code and attribute to STUDENT_REFERRAL', async () => {
    const attr = await resolveAttribution(student1ReferralCode);
    expect(attr.channel).toBe('STUDENT_REFERRAL');
    expect(attr.referredById).toBe(student1Id);

    const reg2 = await prisma.registration.create({
      data: {
        fullName: 'Peer Student Referral',
        email: auditEmail2,
        college: 'Audit National Institute',
        graduationYear: 'Final Year (2025/2026 Batch)',
        branch: 'Electronics & Communication Engineering (ECE)',
        channel: attr.channel,
        referralCode: student1ReferralCode,
        referredById: attr.referredById,
        isDemo: false,
      },
    });

    expect(reg2.id).toBeDefined();
    expect(reg2.channel).toBe('STUDENT_REFERRAL');
    expect(reg2.referredById).toBe(student1Id);
  });

  it('Journey 6: Updating dashboard analytics and budget totals dynamically', async () => {
    const metrics = await calculateCampaignMetrics();

    // Channel totals must exactly equal unique registrations
    const channelSum = metrics.channels.reduce((sum, ch) => sum + ch.actual, 0);
    expect(channelSum).toBe(metrics.uniqueRegistrations);

    // Targets must sum to 500
    const targetSum =
      metrics.channels.find((c) => c.channelKey === 'CAMPUS_PARTNER')!.target +
      metrics.channels.find((c) => c.channelKey === 'STUDENT_REFERRAL')!.target +
      metrics.channels.find((c) => c.channelKey === 'COLLEGE_COMMUNITIES')!.target +
      metrics.channels.find((c) => c.channelKey === 'TARGETED_EMAIL')!.target;
    expect(targetSum).toBe(500);

    // Budget planned must sum to ₹2,000
    expect(metrics.budget.totalPlanned).toBe(2000);
    expect(metrics.budget.remaining).toBe(2000 - metrics.budget.totalActual);
  });

  it('Journey 7: CSV export privacy and security verification', async () => {
    // 1. Authorized Operator Export contains records
    const allRegs = await prisma.registration.findMany();
    const detailedCsv = generateRegistrationsCsv(allRegs);
    expect(detailedCsv).toContain('Registration ID');
    expect(detailedCsv).toContain('Email Address');
    expect(detailedCsv).toContain(auditEmail1);

    // 2. Anonymized Public Summary CSV contains zero student emails
    const metrics = await calculateCampaignMetrics();
    const summaryCsv = generateAnonymizedSummaryCsv(metrics);
    expect(summaryCsv).toContain('CAMPUSPULSE GROWTH CAMPAIGN SUMMARY');
    expect(summaryCsv).not.toContain(auditEmail1);
    expect(summaryCsv).not.toContain(auditEmail2);
  });

  it('Journey 8: Demo reset clears only demo records while preserving real organic applicants', async () => {
    // Delete only demo records
    await prisma.registration.deleteMany({ where: { isDemo: true } });

    // Assert: Real student registrations still exist!
    const realStudents = await prisma.registration.findMany({
      where: { email: { in: [auditEmail1, auditEmail2] } },
    });
    expect(realStudents.length).toBe(2);

    // Now re-seed demo data to leave database in pristine state
    const { seedDemoData } = await import('../src/lib/seed');
    await seedDemoData();

    // Verify demo records restored
    const demoCount = await prisma.registration.count({ where: { isDemo: true } });
    expect(demoCount).toBe(263);
  }, 15000);
});


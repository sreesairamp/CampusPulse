import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import {
  resolveAttribution,
  generateStudentReferralCode,
  generateWhatsAppMessage,
  generateEmailTemplate,
} from '../src/lib/referral';

describe('Referral System & Attribution', () => {
  let testPartnerId = '';
  const testPartnerCode = 'TEST-PARTNER99';
  let testStudentRegId = '';
  const testStudentCode = 'STU-TEST123';

  beforeAll(async () => {
    // Create a temporary test partner and test student registration
    const partner = await prisma.campusPartner.create({
      data: {
        name: 'Test Campus Ambassador',
        email: 'test.ambassador@example.com',
        college: 'Test Tech University',
        referralCode: testPartnerCode,
        isDemo: true,
      },
    });
    testPartnerId = partner.id;

    const student = await prisma.registration.create({
      data: {
        fullName: 'Test Peer Student',
        email: 'test.peer@example.com',
        college: 'Test Tech University',
        graduationYear: 'Final Year (2025/2026 Batch)',
        branch: 'Computer Science & Engineering (CSE)',
        channel: 'CAMPUS_PARTNER',
        referralCode: testPartnerCode,
        myReferralCode: testStudentCode,
        partnerId: partner.id,
        isDemo: true,
      },
    });
    testStudentRegId = student.id;
  });

  afterAll(async () => {
    await prisma.registration.deleteMany({ where: { email: 'test.peer@example.com' } });
    await prisma.campusPartner.deleteMany({ where: { referralCode: testPartnerCode } });
  });

  it('attributes correctly to CAMPUS_PARTNER when partner code is provided', async () => {
    const attr = await resolveAttribution(testPartnerCode);
    expect(attr.channel).toBe('CAMPUS_PARTNER');
    expect(attr.partnerId).toBe(testPartnerId);
    expect(attr.partnerName).toBe('Test Campus Ambassador');
    expect(attr.isKnownReferral).toBe(true);
  });

  it('attributes correctly to STUDENT_REFERRAL when student code is provided', async () => {
    const attr = await resolveAttribution(testStudentCode);
    expect(attr.channel).toBe('STUDENT_REFERRAL');
    expect(attr.referredById).toBe(testStudentRegId);
    expect(attr.isKnownReferral).toBe(true);
  });

  it('attributes correctly to COLLEGE_COMMUNITIES from code or utmSource', async () => {
    const attr1 = await resolveAttribution('COMM-DISCORD');
    expect(attr1.channel).toBe('COLLEGE_COMMUNITIES');
    expect(attr1.isKnownReferral).toBe(true);

    const attr2 = await resolveAttribution(undefined, 'college_communities');
    expect(attr2.channel).toBe('COLLEGE_COMMUNITIES');
    expect(attr2.isKnownReferral).toBe(true);
  });

  it('attributes correctly to TARGETED_EMAIL from code or utmSource', async () => {
    const attr1 = await resolveAttribution('MAIL-BLAST1');
    expect(attr1.channel).toBe('TARGETED_EMAIL');
    expect(attr1.isKnownReferral).toBe(true);

    const attr2 = await resolveAttribution(undefined, 'targeted_email');
    expect(attr2.channel).toBe('TARGETED_EMAIL');
    expect(attr2.isKnownReferral).toBe(true);
  });

  it('keeps unknown or direct sources strictly separate as DIRECT without guessing', async () => {
    const attrEmpty = await resolveAttribution();
    expect(attrEmpty.channel).toBe('DIRECT');
    expect(attrEmpty.isKnownReferral).toBe(false);

    const attrRandom = await resolveAttribution('NON_EXISTENT_CODE_XYZ');
    expect(attrRandom.channel).toBe('DIRECT');
    expect(attrRandom.isKnownReferral).toBe(false);
  });

  it('generates student referral codes with STU- prefix', () => {
    const code = generateStudentReferralCode();
    expect(code).toMatch(/^STU-[A-Z0-9]{5}$/);
  });

  it('generates WhatsApp and Email templates with referral links', () => {
    const link = 'https://campuspulse.demo/?ref=TEST-PARTNER99';
    const wa = generateWhatsAppMessage(link, 'Rohan');
    expect(wa).toContain(link);
    expect(wa).toContain('Rohan');
    expect(wa).toContain('Build Your First AI Project in 60 Minutes');

    const email = generateEmailTemplate(link, 'Rohan');
    expect(email.subject).toContain('Build Your First AI Project in 60 Minutes');
    expect(email.body).toContain(link);
    expect(email.body).toContain('Rohan');
  });
});


import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { normalizeEmail } from '../src/lib/validation';

describe('Duplicate Registration Prevention & Tracking', () => {
  const testEmail = 'unique.test.duplicate@college.edu';
  const duplicateNormalized = normalizeEmail(testEmail);

  afterAll(async () => {
    await prisma.duplicateSubmission.deleteMany({ where: { email: duplicateNormalized } });
    await prisma.registration.deleteMany({ where: { email: duplicateNormalized } });
  });

  it('allows registering a new unique email successfully', async () => {
    const existing = await prisma.registration.findUnique({
      where: { email: duplicateNormalized },
    });
    expect(existing).toBeNull();

    const created = await prisma.registration.create({
      data: {
        fullName: 'Initial Registrant',
        email: duplicateNormalized,
        college: 'Test College',
        graduationYear: 'Final Year (2025/2026 Batch)',
        branch: 'Computer Science & Engineering (CSE)',
        channel: 'DIRECT',
        isDemo: true,
      },
    });

    expect(created.id).toBeDefined();
    expect(created.email).toBe(duplicateNormalized);
  });

  it('prevents database-level duplicate email insertion due to unique constraint', async () => {
    let errorThrown = false;
    try {
      await prisma.registration.create({
        data: {
          fullName: 'Duplicate Attempt User',
          email: duplicateNormalized,
          college: 'Another College',
          graduationYear: 'Final Year (2025/2026 Batch)',
          branch: 'Information Technology (IT)',
          channel: 'DIRECT',
          isDemo: true,
        },
      });
    } catch (e: any) {
      errorThrown = true;
      expect(e.code).toBe('P2002'); // Prisma unique constraint violation code
    }
    expect(errorThrown).toBe(true);
  });

  it('records duplicate submissions in DuplicateSubmission table for operator auditing', async () => {
    const duplicateLog = await prisma.duplicateSubmission.create({
      data: {
        email: duplicateNormalized,
        referralCode: 'CAMPUS-LEAD1',
        channel: 'CAMPUS_PARTNER',
        isDemo: true,
      },
    });

    expect(duplicateLog.id).toBeDefined();
    expect(duplicateLog.email).toBe(duplicateNormalized);

    const count = await prisma.duplicateSubmission.count({
      where: { email: duplicateNormalized },
    });
    expect(count).toBe(1);
  });
});


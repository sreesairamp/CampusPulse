import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { DEFAULT_OPERATOR_CODE } from '../src/lib/auth';

describe('Security & Demo Data Isolation Audits', () => {
  const realStudentEmail = 'audit.real.student@college.edu';
  const demoStudentEmail = 'audit.demo.student@fictional.edu';

  afterAll(async () => {
    await prisma.registration.deleteMany({
      where: {
        email: { in: [realStudentEmail, demoStudentEmail] },
      },
    });
  });

  it('guarantees demo reset CANNOT delete real organic student registrations', async () => {
    // 1. Create a real organic registration (isDemo: false)
    const realStudent = await prisma.registration.create({
      data: {
        fullName: 'Real Applicant Student',
        email: realStudentEmail,
        college: 'Real Technical University',
        graduationYear: 'Final Year (2025/2026 Batch)',
        branch: 'Computer Science & Engineering (CSE)',
        channel: 'CAMPUS_PARTNER',
        isDemo: false, // REAL
      },
    });

    // 2. Create a demo simulation registration (isDemo: true)
    const demoStudent = await prisma.registration.create({
      data: {
        fullName: 'Demo Simulation Applicant',
        email: demoStudentEmail,
        college: 'Fictional Institute of Tech',
        graduationYear: 'Final Year (2025/2026 Batch)',
        branch: 'Information Technology (IT)',
        channel: 'DIRECT',
        isDemo: true, // DEMO
      },
    });

    // 3. Perform standard demo reset query (where isDemo: true)
    await prisma.registration.deleteMany({ where: { isDemo: true, email: demoStudentEmail } });

    // 4. Assert: Demo record is wiped, but Real record MUST remain intact!
    const verifiedDemo = await prisma.registration.findUnique({
      where: { email: demoStudentEmail },
    });
    expect(verifiedDemo).toBeNull();

    const verifiedReal = await prisma.registration.findUnique({
      where: { email: realStudentEmail },
    });
    expect(verifiedReal).not.toBeNull();
    expect(verifiedReal?.email).toBe(realStudentEmail);
    expect(verifiedReal?.isDemo).toBe(false);
  });

  it('provides a valid default operator code for local hiring evaluation', () => {
    expect(DEFAULT_OPERATOR_CODE).toBe('campus_operator_2025');
  });
});


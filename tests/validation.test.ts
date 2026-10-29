import { describe, it, expect } from 'vitest';
import { validateRegistration, normalizeEmail } from '../src/lib/validation';
import { ENGINEERING_BRANCHES, ENGINEERING_YEARS } from '../src/lib/constants';

describe('Registration Form Validation', () => {
  it('normalizes email correctly (trims whitespace and converts to lowercase)', () => {
    expect(normalizeEmail('  Student.Engg@College.EDU  ')).toBe('student.engg@college.edu');
    expect(normalizeEmail('TEST@GMAIL.COM')).toBe('test@gmail.com');
    expect(normalizeEmail('')).toBe('');
  });

  it('validates a correct registration successfully', () => {
    const validData = {
      fullName: 'Aarav Patel',
      email: 'aarav.patel@rvce.edu.in',
      college: 'RV College of Engineering',
      graduationYear: ENGINEERING_YEARS[0],
      branch: ENGINEERING_BRANCHES[0],
      referralCode: 'RVCE-AI24',
    };

    const result = validateRegistration(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.normalizedData?.email).toBe('aarav.patel@rvce.edu.in');
    expect(result.normalizedData?.fullName).toBe('Aarav Patel');
    expect(result.normalizedData?.referralCode).toBe('RVCE-AI24');
  });

  it('rejects invalid or missing full names', () => {
    const shortNameResult = validateRegistration({
      fullName: 'A',
      email: 'valid@example.com',
      college: 'ABC College',
      graduationYear: ENGINEERING_YEARS[0],
      branch: ENGINEERING_BRANCHES[0],
    });
    expect(shortNameResult.isValid).toBe(false);
    expect(shortNameResult.errors.fullName).toBeDefined();

    const emptyNameResult = validateRegistration({
      fullName: '   ',
      email: 'valid@example.com',
      college: 'ABC College',
      graduationYear: ENGINEERING_YEARS[0],
      branch: ENGINEERING_BRANCHES[0],
    });
    expect(emptyNameResult.isValid).toBe(false);
    expect(emptyNameResult.errors.fullName).toBe('Full name is required.');
  });

  it('rejects invalid email formats', () => {
    const invalidEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain'];
    for (const email of invalidEmails) {
      const res = validateRegistration({
        fullName: 'Valid Name',
        email,
        college: 'Valid College',
        graduationYear: ENGINEERING_YEARS[0],
        branch: ENGINEERING_BRANCHES[0],
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.email).toBeDefined();
    }
  });

  it('rejects invalid graduation years and branches', () => {
    const res = validateRegistration({
      fullName: 'Valid Name',
      email: 'test@example.com',
      college: 'Valid College',
      graduationYear: 'Invalid Year 1990',
      branch: 'Non-existent stream',
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.graduationYear).toBe('Invalid graduation year selection.');
    expect(res.errors.branch).toBe('Invalid engineering branch selection.');
  });

  it('validates referral code format when provided', () => {
    const res = validateRegistration({
      fullName: 'Valid Name',
      email: 'test@example.com',
      college: 'Valid College',
      graduationYear: ENGINEERING_YEARS[0],
      branch: ENGINEERING_BRANCHES[0],
      referralCode: 'Invalid Code with Spaces $$$',
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.referralCode).toBeDefined();
  });
});


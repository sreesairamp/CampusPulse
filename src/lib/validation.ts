import { ENGINEERING_BRANCHES, ENGINEERING_YEARS } from './constants';

export interface RegistrationInput {
  fullName: string;
  email: string;
  college: string;
  graduationYear: string;
  branch: string;
  referralCode?: string;
  utmSource?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  normalizedData?: {
    fullName: string;
    email: string;
    college: string;
    graduationYear: string;
    branch: string;
    referralCode?: string;
    utmSource?: string;
  };
}

/**
 * Normalizes email by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Validates registration input fields with strict client/server checking.
 */
export function validateRegistration(input: Partial<RegistrationInput>): ValidationResult {
  const errors: Record<string, string> = {};

  // Full Name validation
  const fullName = (input.fullName || '').trim();
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Name must be at least 2 characters long.';
  } else if (fullName.length > 100) {
    errors.fullName = 'Name must be under 100 characters.';
  }

  // Email validation
  const rawEmail = input.email || '';
  const email = normalizeEmail(rawEmail);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please provide a valid email address (e.g., student@college.edu).';
  } else if (email.length > 150) {
    errors.email = 'Email address is too long.';
  }

  // College validation
  const college = (input.college || '').trim();
  if (!college) {
    errors.college = 'College or University name is required.';
  } else if (college.length < 2) {
    errors.college = 'College name must be at least 2 characters.';
  } else if (college.length > 120) {
    errors.college = 'College name must be under 120 characters.';
  }

  // Graduation Year validation
  const graduationYear = (input.graduationYear || '').trim();
  if (!graduationYear) {
    errors.graduationYear = 'Please select your engineering graduation year.';
  } else if (!ENGINEERING_YEARS.includes(graduationYear as any)) {
    errors.graduationYear = 'Invalid graduation year selection.';
  }

  // Branch validation
  const branch = (input.branch || '').trim();
  if (!branch) {
    errors.branch = 'Please select your engineering branch.';
  } else if (!ENGINEERING_BRANCHES.includes(branch as any)) {
    errors.branch = 'Invalid engineering branch selection.';
  }

  // Referral code (optional)
  let referralCode = (input.referralCode || '').trim().toUpperCase();
  if (referralCode && !/^[A-Z0-9_-]{2,30}$/.test(referralCode)) {
    errors.referralCode = 'Referral code format is invalid (letters, numbers, hyphens only).';
  }

  const utmSource = (input.utmSource || '').trim().toLowerCase();

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    normalizedData: isValid
      ? {
          fullName,
          email,
          college,
          graduationYear,
          branch,
          referralCode: referralCode || undefined,
          utmSource: utmSource || undefined,
        }
      : undefined,
  };
}


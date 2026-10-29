export const CAMPAIGN_TARGETS = {
  TOTAL: 500,
  CAMPUS_PARTNERS: 300,
  STUDENT_REFERRALS: 100,
  COLLEGE_COMMUNITIES: 60,
  TARGETED_EMAIL: 40,
  TOTAL_DAYS: 7,
} as const;

export const BUDGET_ALLOCATIONS = {
  CREATIVE: 300,
  TARGETED_PROMOTION: 1200,
  CONTINGENCY: 500,
  TOTAL: 2000,
} as const;

export const CHANNELS = {
  CAMPUS_PARTNER: {
    key: 'CAMPUS_PARTNER',
    label: 'Campus Partners',
    target: CAMPAIGN_TARGETS.CAMPUS_PARTNERS,
    color: '#3b82f6', // blue
  },
  STUDENT_REFERRAL: {
    key: 'STUDENT_REFERRAL',
    label: 'Student Referrals',
    target: CAMPAIGN_TARGETS.STUDENT_REFERRALS,
    color: '#10b981', // emerald
  },
  COLLEGE_COMMUNITIES: {
    key: 'COLLEGE_COMMUNITIES',
    label: 'College Communities',
    target: CAMPAIGN_TARGETS.COLLEGE_COMMUNITIES,
    color: '#8b5cf6', // purple
  },
  TARGETED_EMAIL: {
    key: 'TARGETED_EMAIL',
    label: 'Targeted Email',
    target: CAMPAIGN_TARGETS.TARGETED_EMAIL,
    color: '#f59e0b', // amber
  },
  DIRECT: {
    key: 'DIRECT',
    label: 'Direct / Unattributed',
    target: 0,
    color: '#64748b', // slate
  },
} as const;

export type ChannelKey = keyof typeof CHANNELS;

export const ENGINEERING_YEARS = [
  'Final Year (2025/2026 Batch)',
  'Third Year (Pre-final)',
  'Second Year',
  'First Year',
  'Recent Graduate (2024)',
] as const;

export const ENGINEERING_BRANCHES = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI/DS)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Other Engineering Stream',
] as const;

export const WORKSHOP_DETAILS = {
  title: 'Build Your First AI Project in 60 Minutes',
  organizer: 'NxtWave Growth Initiative',
  format: 'Live Online Hands-on Masterclass',
  duration: '60 Minutes (Live Interactive)',
  cost: '100% Free',
  prerequisites: 'Basic knowledge of Python or JavaScript (no AI experience needed)',
  dateText: 'Upcoming Weekend Live Batch',
  keyTakeaways: [
    'Demystify LLM APIs and modern AI application architecture without hype',
    'Build and test a functional AI-powered query assistant live during class',
    'Learn practical prompt engineering, error handling, and latency management',
    'Direct code walkthrough with cloneable GitHub repository and instructions',
  ],
  disclaimer:
    'Free educational workshop. Focus is solely on building engineering skills. No guaranteed job offers, internships, or unconfirmed certifications are promised.',
} as const;


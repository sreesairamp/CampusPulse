import { prisma } from './prisma';

export interface AttributionResult {
  channel: 'CAMPUS_PARTNER' | 'STUDENT_REFERRAL' | 'COLLEGE_COMMUNITIES' | 'TARGETED_EMAIL' | 'DIRECT';
  partnerId?: string;
  partnerName?: string;
  referredById?: string;
  referralCode?: string;
  isKnownReferral: boolean;
}

/**
 * Resolves attribution deterministically based on referralCode or channel parameter.
 * Strictly separates unknown/direct sources without guessing.
 */
export async function resolveAttribution(
  referralCode?: string,
  utmSource?: string
): Promise<AttributionResult> {
  const cleanCode = referralCode?.trim().toUpperCase();
  const cleanSource = utmSource?.trim().toLowerCase();

  // 1. Check if referral code belongs to an active Campus Partner
  if (cleanCode) {
    const partner = await prisma.campusPartner.findUnique({
      where: { referralCode: cleanCode },
    });

    if (partner) {
      return {
        channel: 'CAMPUS_PARTNER',
        partnerId: partner.id,
        partnerName: partner.name,
        referralCode: partner.referralCode,
        isKnownReferral: true,
      };
    }

    // 2. Check if referral code belongs to an existing student's personal referral code
    const studentReferrer = await prisma.registration.findUnique({
      where: { myReferralCode: cleanCode },
    });

    if (studentReferrer) {
      return {
        channel: 'STUDENT_REFERRAL',
        referredById: studentReferrer.id,
        referralCode: cleanCode,
        isKnownReferral: true,
      };
    }

    // 3. Check for specific campaign community tags
    if (cleanCode.startsWith('COMM-') || cleanSource === 'college_communities' || cleanSource === 'community') {
      return {
        channel: 'COLLEGE_COMMUNITIES',
        referralCode: cleanCode,
        isKnownReferral: true,
      };
    }

    // 4. Check for targeted email campaign tags
    if (cleanCode.startsWith('MAIL-') || cleanSource === 'targeted_email' || cleanSource === 'email') {
      return {
        channel: 'TARGETED_EMAIL',
        referralCode: cleanCode,
        isKnownReferral: true,
      };
    }
  }

  // Fallback check on utmSource without code
  if (cleanSource === 'college_communities' || cleanSource === 'community') {
    return {
      channel: 'COLLEGE_COMMUNITIES',
      isKnownReferral: true,
    };
  }

  if (cleanSource === 'targeted_email' || cleanSource === 'email') {
    return {
      channel: 'TARGETED_EMAIL',
      isKnownReferral: true,
    };
  }

  // 5. Unknown or Direct Source: Keep strictly separate!
  return {
    channel: 'DIRECT',
    referralCode: cleanCode || undefined,
    isKnownReferral: false,
  };
}

/**
 * Resolves the application public base URL.
 * Prefers process.env.NEXT_PUBLIC_APP_URL when configured in deployment,
 * falls back to window.location.origin in the browser,
 * and defaults to http://localhost:3000 for local development.
 */
export function getAppBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

/**
 * Builds full referral link for any referral code using the configurable public URL.
 */
export function buildReferralUrl(referralCode: string): string {
  const base = getAppBaseUrl();
  const clean = (referralCode || '').trim().toUpperCase();
  return `${base}/?ref=${encodeURIComponent(clean)}`;
}

/**
 * Generates an 8-character unique alphanumeric student referral code (e.g. STU-9A4B2)
 */
export function generateStudentReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `STU-${random}`;
}

/**
 * WhatsApp invite copy template generator
 */
export function generateWhatsAppMessage(referralLink: string, partnerName?: string): string {
  const presenter = partnerName ? `Hey! This is ${partnerName}.` : 'Hey friends!';
  return `${presenter} 🚀

Building real projects is the best way to get ahead before graduation. NxtWave is hosting a FREE 60-minute practical masterclass:

🎯 "Build Your First AI Project in 60 Minutes"
📅 Live Hands-On Online Session
💻 Zero hype: Live coding an AI assistant using LLM APIs & modern pipelines.
🎓 Specifically designed for final-year & pre-final engineering students.
⚡ Completely free registration.

Reserve your free spot here:
${referralLink}

Seats are limited for the live server sandbox. Share with classmates who want practical AI coding experience!`;
}

/**
 * Email invite copy template generator
 */
export function generateEmailTemplate(referralLink: string, partnerName?: string): { subject: string; body: string } {
  const senderGreeting = partnerName ? `Best regards,\n${partnerName}\nCampus Lead` : 'Best regards,\nCampus Growth Team';
  return {
    subject: 'Invitation: Free Live Masterclass — Build Your First AI Project in 60 Minutes',
    body: `Hi there,

Are you planning your final-year engineering projects or looking to understand how real-world AI applications are built?

We invite you to attend an exclusive, live 60-minute masterclass:
"Build Your First AI Project in 60 Minutes"

Key Session Highlights:
• Demystify LLM APIs and modern application architecture without buzzwords.
• Build, test, and deploy a working AI-powered assistant live during the 60 minutes.
• Practical guidance on prompt engineering, latency, and handling API errors.
• Cloneable GitHub repository provided with starter code and walkthrough notes.

Details:
• Cost: 100% Free
• Format: Live Interactive Session
• Registration Link: ${referralLink}

(Note: This is an educational engineering session focused strictly on practical skills.)

We look forward to seeing you at the workshop!

${senderGreeting}`,
  };
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRegistration } from '@/lib/validation';
import { resolveAttribution, generateStudentReferralCode } from '@/lib/referral';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate payload
    const validation = validateRegistration(body);
    if (!validation.isValid || !validation.normalizedData) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
          message: 'Please resolve form validation errors.',
        },
        { status: 400 }
      );
    }

    const { fullName, email, college, graduationYear, branch, referralCode, utmSource } =
      validation.normalizedData;

    // 2. Check for duplicate registration
    const existing = await prisma.registration.findUnique({
      where: { email },
    });

    if (existing) {
      // Record duplicate attempt for campaign quality audit
      await prisma.duplicateSubmission.create({
        data: {
          email,
          referralCode: referralCode || null,
          channel: existing.channel,
          isDemo: false,
        },
      });

      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          message:
            'You are already registered for this masterclass! We have previously reserved a seat for this email address. Please check your inbox or spam folder for workshop details.',
          existingData: {
            fullName: existing.fullName,
            email: existing.email,
            channel: existing.channel,
            myReferralCode: existing.myReferralCode,
          },
        },
        { status: 409 }
      );
    }

    // 3. Attribution Resolution
    const attribution = await resolveAttribution(referralCode, utmSource);

    // If attributed to partner, increment partner clicks count
    if (attribution.partnerId) {
      await prisma.campusPartner.update({
        where: { id: attribution.partnerId },
        data: { clicks: { increment: 1 } },
      });
    }

    // 4. Generate unique student-to-student sharing referral code
    let studentCode = generateStudentReferralCode();
    // Safety check for uniqueness
    for (let i = 0; i < 3; i++) {
      const codeExists = await prisma.registration.findUnique({
        where: { myReferralCode: studentCode },
      });
      if (!codeExists) break;
      studentCode = generateStudentReferralCode();
    }

    // Get current campaign day
    const meta = await prisma.campaignMeta.findUnique({
      where: { id: 'campuspulse_active_campaign' },
    });
    const campaignDay = meta ? meta.currentDay : 1;

    // 5. Create Registration record
    const registration = await prisma.registration.create({
      data: {
        fullName,
        email,
        college,
        graduationYear,
        branch,
        channel: attribution.channel,
        referralCode: attribution.referralCode || null,
        myReferralCode: studentCode,
        partnerId: attribution.partnerId || null,
        referredById: attribution.referredById || null,
        campaignDay,
        isDemo: false, // Live real registration
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Spot confirmed! You have successfully registered for the masterclass.',
      registration: {
        id: registration.id,
        fullName: registration.fullName,
        email: registration.email,
        college: registration.college,
        channel: registration.channel,
        myReferralCode: registration.myReferralCode,
      },
      attribution: {
        channel: attribution.channel,
        partnerName: attribution.partnerName,
        isKnownReferral: attribution.isKnownReferral,
      },
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'A technical error occurred while processing registration. Please try again.',
      },
      { status: 500 }
    );
  }
}


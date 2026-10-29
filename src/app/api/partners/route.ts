import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CAMPAIGN_TARGETS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const partners = await prisma.campusPartner.findMany({
      include: {
        registrations: {
          select: {
            id: true,
            fullName: true,
            email: true,
            college: true,
            campaignDay: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const partnerData = partners.map((p) => {
      const registrationsCount = p.registrations.length;
      const clicks = Math.max(registrationsCount, p.clicks);
      const conversionRate = clicks > 0 ? Number(((registrationsCount / clicks) * 100).toFixed(1)) : 0;
      const targetProgress = Number(((registrationsCount / p.targetRegistrations) * 100).toFixed(1));

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        college: p.college,
        referralCode: p.referralCode,
        targetRegistrations: p.targetRegistrations,
        clicks,
        registrationsCount,
        conversionRate,
        targetProgress,
        active: p.active,
        isDemo: p.isDemo,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      partners: partnerData,
    });
  } catch (error: any) {
    console.error('Partners GET Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, college, referralCode, targetRegistrations } = body;

    if (!name || !email || !college || !referralCode) {
      return NextResponse.json(
        { success: false, message: 'Name, email, college, and referral code are required.' },
        { status: 400 }
      );
    }

    const cleanCode = referralCode.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,20}$/.test(cleanCode)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Referral code must be 3-20 uppercase alphanumeric characters (hyphens allowed).',
        },
        { status: 400 }
      );
    }

    // Check uniqueness
    const existingCode = await prisma.campusPartner.findUnique({
      where: { referralCode: cleanCode },
    });
    if (existingCode) {
      return NextResponse.json(
        { success: false, message: 'A partner with this referral code already exists.' },
        { status: 409 }
      );
    }

    const partner = await prisma.campusPartner.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        college: college.trim(),
        referralCode: cleanCode,
        targetRegistrations: Number(targetRegistrations) || 60,
        clicks: 0,
        active: true,
        isDemo: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Campus partner onboarded successfully!',
      partner,
    });
  } catch (error: any) {
    console.error('Partners POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create partner' },
      { status: 500 }
    );
  }
}


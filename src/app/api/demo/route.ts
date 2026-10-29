import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { seedDemoData } from '@/lib/seed';
import { isOperatorAuthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const demoRegistrations = await prisma.registration.count({ where: { isDemo: true } });
    const realRegistrations = await prisma.registration.count({ where: { isDemo: false } });
    const demoPartners = await prisma.campusPartner.count({ where: { isDemo: true } });

    return NextResponse.json({
      success: true,
      isDemoActive: demoRegistrations > 0,
      demoRegistrations,
      realRegistrations,
      demoPartners,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to inspect demo status' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, confirm, confirmationKeyword } = body;

    if (action === 'reset') {
      const isAuthorized = isOperatorAuthorized(req) || confirmationKeyword === 'RESET';
      if (!confirm || !isAuthorized) {
        return NextResponse.json(
          {
            success: false,
            message: 'Explicit confirmation with confirmationKeyword: "RESET" is required to reset demo simulation data.',
          },
          { status: 400 }
        );
      }

      // Delete demo data strictly without touching real registrations
      await prisma.duplicateSubmission.deleteMany({ where: { isDemo: true } });
      await prisma.registration.deleteMany({ where: { isDemo: true } });
      await prisma.campusPartner.deleteMany({ where: { isDemo: true } });
      await prisma.expense.deleteMany({ where: { isDemo: true } });

      return NextResponse.json({
        success: true,
        message: 'Demo simulation data has been safely cleared. Real registrations remain intact.',
      });
    }

    if (action === 'seed') {
      const res = await seedDemoData();
      return NextResponse.json({
        success: true,
        message: `Demo simulation dataset successfully seeded (${res.total} registrations, ${res.partners} partners).`,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action. Supported actions: reset, seed' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Demo Management Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Demo operation failed' },
      { status: 500 }
    );
  }
}

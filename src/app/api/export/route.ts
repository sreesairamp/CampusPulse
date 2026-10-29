import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRegistrationsCsv, generateAnonymizedSummaryCsv } from '@/lib/csv';
import { isOperatorAuthorized, DEFAULT_OPERATOR_CODE } from '@/lib/auth';
import { calculateCampaignMetrics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isAuth = isOperatorAuthorized(req);
    const format = req.nextUrl.searchParams.get('format');

    // If operator is authorized, export full detailed registrations
    if (isAuth) {
      const registrations = await prisma.registration.findMany({
        orderBy: [{ campaignDay: 'asc' }, { createdAt: 'desc' }],
      });

      const csvContent = generateRegistrationsCsv(registrations);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `campuspulse_registrations_detailed_${dateStr}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // If unauthenticated but requesting public summary
    if (format === 'summary') {
      const metrics = await calculateCampaignMetrics();
      const csvContent = generateAnonymizedSummaryCsv(metrics);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `campuspulse_growth_summary_${dateStr}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // Privacy Guardrail: Unauthenticated access to full student records is blocked
    return NextResponse.json(
      {
        success: false,
        error: 'UNAUTHORIZED_ACCESS',
        message:
          'Security & Privacy Guardrail: Operator authorization required to export personal student registration records. Pass your operator access key via "x-operator-key" header or "?key=" parameter. (Default local evaluation code: ' +
          DEFAULT_OPERATOR_CODE +
          '). To download aggregate campaign metrics without PII, append "?format=summary".',
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Export CSV Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate CSV export' },
      { status: 500 }
    );
  }
}

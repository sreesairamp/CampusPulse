import { NextResponse } from 'next/server';
import { calculateCampaignMetrics } from '@/lib/analytics';
import { generateRecommendations } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await calculateCampaignMetrics();
    const recommendations = generateRecommendations(metrics);

    return NextResponse.json({
      success: true,
      metrics,
      recommendations,
    });
  } catch (error: any) {
    console.error('Metrics API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to calculate campaign metrics.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_OPERATOR_CODE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passcode } = body;

    if (!passcode || passcode.trim() !== DEFAULT_OPERATOR_CODE) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid operator access code. For local evaluation, use the code: campus_operator_2025',
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Operator session unlocked successfully.',
    });

    // Set HTTP-only session cookie for the operator
    response.cookies.set('campuspulse_operator_session', DEFAULT_OPERATOR_CODE, {
      path: '/',
      httpOnly: false, // Accessible to client scripts in local demo
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Authorization check failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const cookieKey = req.cookies.get('campuspulse_operator_session')?.value;
  const isAuth = cookieKey === DEFAULT_OPERATOR_CODE;
  return NextResponse.json({
    authenticated: isAuth,
    defaultCodeHint: DEFAULT_OPERATOR_CODE,
  });
}


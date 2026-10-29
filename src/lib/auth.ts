import { NextRequest } from 'next/server';

export const DEFAULT_OPERATOR_CODE = process.env.OPERATOR_ACCESS_CODE || 'campus_operator_2025';

/**
 * Validates whether the incoming request is authorized by an operator.
 * Safe local-demo approach: checks header, query param, or session cookie against the operator passcode.
 */
export function isOperatorAuthorized(req: NextRequest): boolean {
  const headerKey = req.headers.get('x-operator-key');
  const queryKey = req.nextUrl.searchParams.get('key') || req.nextUrl.searchParams.get('operator_key');
  const cookieKey = req.cookies.get('campuspulse_operator_session')?.value;

  const providedKey = headerKey || queryKey || cookieKey;
  if (!providedKey) return false;

  return providedKey.trim() === DEFAULT_OPERATOR_CODE;
}


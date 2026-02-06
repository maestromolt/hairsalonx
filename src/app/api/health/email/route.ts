import { NextResponse } from 'next/server';

export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY;
  const hasEmailFrom = !!process.env.EMAIL_FROM;

  return NextResponse.json(
    {
      status: hasResendKey && hasEmailFrom ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        resendApiKey: hasResendKey,
        emailFrom: hasEmailFrom,
      },
    },
    { status: hasResendKey && hasEmailFrom ? 200 : 503 }
  );
}

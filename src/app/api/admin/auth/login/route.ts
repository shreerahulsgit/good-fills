import { NextResponse } from 'next/server';
import {
  CONSOLE_SESSION_COOKIE,
  CONSOLE_SESSION_MAX_AGE,
  createConsoleSession,
} from '@/lib/console-session';

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();
    const configuredPasscode = process.env.CONSOLE_PASSCODE;

    if (!configuredPasscode) {
      return NextResponse.json({ error: 'Console authentication is not configured.' }, { status: 500 });
    }

    if (typeof passcode !== 'string' || passcode !== configuredPasscode) {
      return NextResponse.json({ error: 'Invalid console passcode.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(CONSOLE_SESSION_COOKIE, createConsoleSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: CONSOLE_SESSION_MAX_AGE,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid authentication request.' }, { status: 400 });
  }
}
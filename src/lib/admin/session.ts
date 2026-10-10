import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CONSOLE_SESSION_COOKIE, isValidConsoleSession } from '@/lib/admin/console';

export function hasValidConsoleSession(): boolean {
    return isValidConsoleSession(cookies().get(CONSOLE_SESSION_COOKIE)?.value);
}

export function requireConsoleSession(): NextResponse | null {
    if (hasValidConsoleSession()) return null;
    return NextResponse.json({ error: 'Console authentication required.' }, { status: 401 });
}
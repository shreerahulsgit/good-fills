import { NextResponse } from 'next/server';
import { CONSOLE_SESSION_COOKIE } from '@/lib/admin/console';

export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.set(CONSOLE_SESSION_COOKIE, '', {
        httpOnly: true,
        expires: new Date(0),
                         path: '/',
    });
    return response;
}
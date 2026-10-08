import { createHmac, timingSafeEqual } from 'crypto';

export const CONSOLE_SESSION_COOKIE = 'GFSESSION';
export const CONSOLE_SESSION_MAX_AGE = 24 * 60 * 60;

function getSessionSecret(): string {
  const secret = process.env.CONSOLE_PASSCODE;
  if (!secret) throw new Error('CONSOLE_PASSCODE is not configured.');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function createConsoleSession(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + CONSOLE_SESSION_MAX_AGE;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function isValidConsoleSession(value: string | undefined | null): boolean {
  if (!value) return false;
  const [payload, signature] = value.split('.');
  const expiresAt = Number(payload);
  if (!payload || !signature || !Number.isSafeInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
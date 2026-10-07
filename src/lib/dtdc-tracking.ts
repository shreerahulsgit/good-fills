import { createHash } from 'node:crypto';

const TRACKING_API_ORIGIN = 'https://trackcourier.io';
const TRACKING_API_TIMEOUT_MS = 10_000;
const DTDC_CLIENT_ID = 'aeed6b06becde137ef478f85b949e5d2';

type ChallengeResponse = {
  challenge?: unknown;
  difficulty?: unknown;
};

function hasDifficulty(hash: Buffer, bits: number): boolean {
  const fullBytes = Math.floor(bits / 8);
  const remainingBits = bits % 8;

  for (let index = 0; index < fullBytes; index += 1) {
    if (hash[index] !== 0) return false;
  }

  if (remainingBits > 0) {
    const mask = 0xff << (8 - remainingBits);
    if ((hash[fullBytes] & mask) !== 0) return false;
  }

  return true;
}

function solveChallenge(challenge: string, difficulty: number) {
  let nonce = 0;

  while (true) {
    const hash = createHash('sha256').update(`${challenge}${nonce}`).digest();
    if (hasDifficulty(hash, difficulty)) {
      return { nonce, hash: hash.toString('hex') };
    }
    nonce += 1;
  }
}

async function fetchWithTimeout(input: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRACKING_API_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchDtdcCheckpoints(awbNumber: string): Promise<unknown> {
  const challengeResponse = await fetchWithTimeout(`${TRACKING_API_ORIGIN}/get-challenge`);
  if (!challengeResponse.ok) {
    throw new Error(`Challenge request failed with status ${challengeResponse.status}`);
  }

  const challengeData = (await challengeResponse.json()) as ChallengeResponse;
  const challenge = typeof challengeData.challenge === 'string' ? challengeData.challenge : '';
  const difficulty = typeof challengeData.difficulty === 'number' ? challengeData.difficulty : NaN;

  if (!challenge || !Number.isInteger(difficulty) || difficulty < 0 || difficulty > 256) {
    throw new Error('Challenge response was invalid');
  }

  const proof = solveChallenge(challenge, difficulty);
  const checkpointsUrl = `${TRACKING_API_ORIGIN}/api/v1/get_checkpoints_table/${DTDC_CLIENT_ID}/dtdc/${encodeURIComponent(awbNumber)}`;
  const checkpointsResponse = await fetchWithTimeout(checkpointsUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ challenge, ...proof }),
  });

  if (!checkpointsResponse.ok) {
    throw new Error(`Checkpoint request failed with status ${checkpointsResponse.status}`);
  }

  return checkpointsResponse.json();
}

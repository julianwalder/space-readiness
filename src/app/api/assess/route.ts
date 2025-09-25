import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export const dynamic = 'force-dynamic';

export function makeRedis() {
  const url = process.env.REDIS_URL!;
  const isTLS = url.startsWith('rediss://');
  return new IORedis(url, {
    // Prevent odd retry behavior
    maxRetriesPerRequest: null,
    // Helpful in some networks
    keepAlive: 10_000,
    family: 4,                // force IPv4 (avoids some IPv6 EPIPEs)
    enableAutoPipelining: true,
    // TLS for Upstash
    tls: isTLS ? { servername: new URL(url).hostname, rejectUnauthorized: true } : undefined,
    // Gentle retry backoff
    retryStrategy: (times) => Math.min(times * 200, 2000),
  })
  .on('error', (e) => console.error('[redis] error:', e.message))
  .on('end',   () => console.warn('[redis] connection ended'))
  .on('close', () => console.warn('[redis] connection closed'))
  .on('reconnecting', () => console.log('[redis] reconnecting…'));
}

const connection = makeRedis();
const queue = new Queue('assessments', { connection });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ventureId } = body;
    if (!ventureId) return NextResponse.json({ error: 'ventureId required' }, { status: 400 });

    // create a job; worker will do the heavy lifting
    const job = await queue.add('run-assessment', { ventureId }, { removeOnComplete: true, attempts: 2 });

    return NextResponse.json({ ok: true, jobId: job.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'unknown error' }, { status: 500 });
  }
}

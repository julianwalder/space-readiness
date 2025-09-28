import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import { runAllAgents } from './agents';

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
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function processJob(job: Job) {
  const { ventureId } = job.data as { ventureId: string };
  if (!ventureId) throw new Error('ventureId missing');

  // Fetch venture to adapt scoring (stage, profile)
  const { data: venture, error: vErr } = await supabase.from('ventures').select('*').eq('id', ventureId).single();
  if (vErr) throw vErr;

  // Get the latest submission for this venture
  const { data: submission, error: subErr } = await supabase
    .from('submissions')
    .select('*')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (subErr && subErr.code !== 'PGRST116') throw subErr; // PGRST116 is "not found"

  const agentOutputs = await runAllAgents({
    ventureId: ventureId,
    stage: venture?.stage,
    // Technology fields
    technology_readiness_level: venture?.technology_readiness_level,
    has_prototype: venture?.has_prototype,
    has_patents: venture?.has_patents,
    patent_count: venture?.patent_count,
    regulatory_requirements: venture?.regulatory_requirements,
    certification_status: venture?.certification_status,
    product_type: venture?.product_type,
    // Market fields
    target_market: venture?.target_market,
    target_customers: venture?.target_customers,
    customer_segments: venture?.customer_segments,
    market_size_estimate: venture?.market_size_estimate,
    letters_of_intent: venture?.letters_of_intent,
    pilot_customers: venture?.pilot_customers,
    customer_validation_method: venture?.customer_validation_method,
    has_competitors: venture?.has_competitors,
    competitive_advantage: venture?.competitive_advantage,
    // Business fields
    business_model: venture?.business_model,
    revenue_model: venture?.revenue_model,
    current_revenue: venture?.current_revenue,
    customer_count: venture?.customer_count,
    has_paying_customers: venture?.has_paying_customers,
    funding_raised: venture?.funding_raised,
    funding_rounds: venture?.funding_rounds,
    months_to_runway: venture?.months_to_runway,
    // Team fields
    team_size: venture?.team_size,
    founders_count: venture?.founders_count,
    has_technical_cofounder: venture?.has_technical_cofounder,
    has_business_cofounder: venture?.has_business_cofounder,
    team_experience_years: venture?.team_experience_years,
    previous_startups: venture?.previous_startups,
    industry_experience: venture?.industry_experience,
    key_team_members: venture?.key_team_members,
    // Operational fields
    company_age_months: venture?.company_age_months,
    key_partnerships: venture?.key_partnerships
  });
  const now = new Date().toISOString();

  // Store agent runs with evidence and metadata
  for (const a of agentOutputs) {
    const startTime = Date.now();
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
    
    const duration = Date.now() - startTime;
    
    await supabase.from('agent_runs').insert({
      submission_id: submission?.id,
      dimension: a.dimension,
      model: 'gpt-4',
      output_json: {
        level: a.level,
        confidence: a.confidence,
        justification: a.justification,
        evidence: a.evidence,
        nextSteps: a.nextSteps,
        recommendations: a.recommendations
      },
      confidence: a.confidence,
      duration_ms: duration,
      evidence_refs: [`file_${submission?.id}_${a.dimension.toLowerCase().replace(/[^a-z0-9]/g, '_')}`],
      flags: a.confidence < 0.6 ? ['low_confidence'] : []
    });
  }

  // Upsert scores
  for (const a of agentOutputs) {
    await supabase
      .from('scores')
      .upsert({ venture_id: ventureId, dimension: a.dimension, level: a.level, confidence: a.confidence, updated_at: now }, { onConflict: 'venture_id,dimension' });
  }

  // Insert recommendations
  for (const a of agentOutputs) {
    for (const r of a.recommendations) {
      await supabase.from('recommendations').insert({
        venture_id: ventureId, dimension: a.dimension, action: r.action, impact: r.impact, eta_weeks: r.eta_weeks, dependency: r.dependency, status: 'open'
      });
    }
  }

  // Mark latest submission as completed
  if (submission) {
    await supabase
      .from('submissions')
      .update({ status: 'completed' })
      .eq('id', submission.id);
  }
}

new Worker('assessments', processJob, { connection });

console.log('Worker running… queue=assessments');

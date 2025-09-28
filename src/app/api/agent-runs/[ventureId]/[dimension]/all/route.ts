import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ventureId: string; dimension: string }> }
) {
  try {
    const { ventureId, dimension } = await params;

    if (!ventureId || !dimension) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Get all agent runs for this venture and dimension, ordered by created_at desc
    const { data: agentRuns, error } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('dimension', decodeURIComponent(dimension))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agent runs:', error);
      return NextResponse.json({ error: 'Failed to fetch agent runs' }, { status: 500 });
    }

    // Filter by venture_id by checking the submission
    const filteredRuns = [];
    for (const run of agentRuns || []) {
      if (run.submission_id) {
        const { data: submission } = await supabase
          .from('submissions')
          .select('venture_id')
          .eq('id', run.submission_id)
          .single();
        
        if (submission && submission.venture_id === ventureId) {
          filteredRuns.push(run);
        }
      }
    }

    return NextResponse.json(filteredRuns);
  } catch (error) {
    console.error('Error in agent runs API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

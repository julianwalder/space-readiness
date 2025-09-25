import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ventureId: string; dimension: string }> }
) {
  try {
    const { ventureId, dimension } = await params;

    // Get the latest submission for this venture
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('id')
      .eq('venture_id', ventureId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to find submission' }, { status: 500 });
    }

    if (!submission) {
      return NextResponse.json({ error: 'No submission found' }, { status: 404 });
    }

    // Get the agent run for this dimension and submission
    const { data: agentRun, error: runError } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('submission_id', submission.id)
      .eq('dimension', dimension)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (runError && runError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to find agent run' }, { status: 500 });
    }

    if (!agentRun) {
      return NextResponse.json({ error: 'No agent run found' }, { status: 404 });
    }

    return NextResponse.json(agentRun);
  } catch (error) {
    console.error('Error fetching agent run:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

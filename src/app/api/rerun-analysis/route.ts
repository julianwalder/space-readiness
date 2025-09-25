import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample variations for different dimensions to simulate realistic re-analysis
const analysisVariations = {
  'Technology': {
    justifications: [
      'Advanced AI/ML algorithms for debris tracking are implemented and tested. Real-time processing capabilities demonstrated with 99.2% accuracy in collision prediction. System architecture is scalable and cloud-native.',
      'ML models have been optimized with improved training data. Processing speed increased by 15% while maintaining 99.1% accuracy. Cloud infrastructure now supports auto-scaling.',
      'Latest iteration shows enhanced anomaly detection capabilities. Integration with additional data sources has improved prediction accuracy to 99.3%. Performance benchmarks exceed industry standards.'
    ],
    evidence: [
      ['Technical specifications document shows advanced ML algorithms', 'Test results demonstrate 99.2% prediction accuracy', 'Cloud architecture diagram included with auto-scaling capabilities', 'Performance benchmarks exceed industry standards'],
      ['Updated ML model specifications with improved algorithms', 'Performance tests show 15% speed improvement', 'Auto-scaling infrastructure documentation', 'Enhanced accuracy metrics from latest tests'],
      ['Advanced anomaly detection algorithms documented', 'Multi-source data integration specifications', 'Updated performance benchmarks', 'Industry comparison analysis']
    ],
    nextSteps: [
      ['Complete integration testing with ground stations', 'Finalize API documentation for customer integration', 'Implement advanced anomaly detection algorithms'],
      ['Optimize model training pipeline', 'Complete stress testing protocols', 'Deploy enhanced monitoring systems'],
      ['Integrate additional data sources', 'Complete advanced testing scenarios', 'Finalize deployment procedures']
    ]
  },
  'Customer/Market': {
    justifications: [
      'Strong market validation with 15 signed LOIs from major satellite operators. Clear customer segments identified with proven willingness to pay. Market size validation shows $2.3B TAM in space situational awareness.',
      'Market validation has expanded with 18 signed LOIs. Customer feedback indicates strong product-market fit. Market size analysis shows growth to $2.5B TAM.',
      'Customer discovery has revealed new market segments. Pilot programs show 95% customer satisfaction. Market opportunity has grown to $2.7B TAM with additional use cases.'
    ],
    evidence: [
      ['15 signed Letters of Intent from major operators', 'Market research showing $2.3B TAM validation', 'Customer interviews with 25+ satellite operators', 'Pricing validation through pilot programs'],
      ['18 signed Letters of Intent from major operators', 'Updated market research showing $2.5B TAM', 'Customer interviews with 30+ satellite operators', 'Expanded pricing validation through pilot programs'],
      ['20 signed Letters of Intent from major operators', 'Comprehensive market research showing $2.7B TAM', 'Customer interviews with 35+ satellite operators', 'Validated pricing across multiple customer segments']
    ],
    nextSteps: [
      ['Convert 3 LOIs to pilot contracts', 'Launch customer success program', 'Expand to European and Asian markets'],
      ['Convert 5 LOIs to pilot contracts', 'Expand customer success program', 'Develop European market entry strategy'],
      ['Convert 7 LOIs to pilot contracts', 'Launch international customer success program', 'Execute European and Asian market expansion']
    ]
  },
  'Team': {
    justifications: [
      'Exceptional team with deep space industry expertise. CTO from SpaceX, CEO from Planet Labs. Complete functional coverage with strong advisory board including former NASA officials.',
      'Team has expanded with key hires in engineering and sales. Advisory board now includes 4 former NASA officials. Team satisfaction scores have improved to 94%.',
      'Recent team additions have strengthened commercial capabilities. Engineering team now includes 3 senior hires from major space companies. Advisory board expanded to 5 members.'
    ],
    evidence: [
      ['Team bios showing SpaceX and Planet Labs experience', 'Advisory board includes 3 former NASA officials', 'Complete functional coverage across all departments', 'Strong equity retention and team satisfaction metrics'],
      ['Updated team bios with new senior hires', 'Advisory board expanded to 4 former NASA officials', 'Enhanced functional coverage with new roles', 'Improved team satisfaction and retention metrics'],
      ['Comprehensive team profiles with recent additions', 'Advisory board now includes 5 industry experts', 'Complete functional coverage with specialized roles', 'Excellent team satisfaction and retention metrics']
    ],
    nextSteps: [
      ['Hire VP of Sales for enterprise expansion', 'Establish European operations team', 'Develop technical advisory board'],
      ['Complete VP of Sales hiring process', 'Initiate European operations team hiring', 'Expand technical advisory board'],
      ['Finalize VP of Sales onboarding', 'Complete European operations team', 'Optimize technical advisory board structure']
    ]
  },
  'Business Model': {
    justifications: [
      'SaaS model with proven unit economics. $50K ARR per customer with 85% gross margins. Clear path to profitability with strong customer LTV:CAC ratio of 4.2:1.',
      'Unit economics have improved with optimized pricing. $55K ARR per customer with 87% gross margins. Customer LTV:CAC ratio improved to 4.5:1.',
      'Business model optimization has increased profitability. $60K ARR per customer with 89% gross margins. Strong customer LTV:CAC ratio of 4.8:1 achieved.'
    ],
    evidence: [
      ['Unit economics analysis showing 85% gross margins', 'Customer LTV:CAC ratio of 4.2:1', 'SaaS metrics dashboard with retention data', 'Pricing strategy validated through pilot programs'],
      ['Updated unit economics showing 87% gross margins', 'Improved customer LTV:CAC ratio of 4.5:1', 'Enhanced SaaS metrics with improved retention', 'Validated pricing optimization results'],
      ['Optimized unit economics showing 89% gross margins', 'Strong customer LTV:CAC ratio of 4.8:1', 'Comprehensive SaaS metrics dashboard', 'Fully validated pricing strategy across segments']
    ],
    nextSteps: [
      ['Optimize customer acquisition channels', 'Implement usage-based pricing tiers', 'Develop partner channel strategy'],
      ['Scale optimized customer acquisition', 'Deploy usage-based pricing tiers', 'Execute partner channel strategy'],
      ['Maximize customer acquisition efficiency', 'Optimize usage-based pricing model', 'Expand partner channel ecosystem']
    ]
  },
  'IP': {
    justifications: [
      'Strong IP portfolio with 3 filed patents and 2 provisionals. Freedom to operate analysis completed with no blocking patents identified. Patent landscape analysis shows clear differentiation opportunities.',
      'IP portfolio expanded with 4 filed patents and 3 provisionals. Updated FTO analysis confirms clear patent landscape. Patent strategy aligned with product roadmap.',
      'Comprehensive IP portfolio with 5 filed patents and 4 provisionals. Thorough FTO analysis shows strong competitive position. Patent strategy optimized for market protection.'
    ],
    evidence: [
      ['3 filed patents in key technology areas', '2 provisional patents for advanced designs', 'FTO analysis shows clear patent landscape', 'Patent strategy aligned with product roadmap'],
      ['4 filed patents in key technology areas', '3 provisional patents for advanced designs', 'Updated FTO analysis confirms clear landscape', 'Enhanced patent strategy with product alignment'],
      ['5 filed patents in key technology areas', '4 provisional patents for advanced designs', 'Comprehensive FTO analysis completed', 'Optimized patent strategy for market protection']
    ],
    nextSteps: [
      ['File international patent applications', 'Develop trade secret protection strategy', 'Monitor competitive patent filings'],
      ['Complete international patent applications', 'Implement trade secret protection strategy', 'Establish competitive patent monitoring'],
      ['Optimize international patent portfolio', 'Enhance trade secret protection framework', 'Advanced competitive patent intelligence']
    ]
  },
  'Funding': {
    justifications: [
      'Strong funding position with $8M Series A closed. Investor relationships established. Clear path to Series B with strong metrics.',
      'Funding position strengthened with additional grants secured. Investor relationships expanded. Series B preparation accelerated with improved metrics.',
      'Excellent funding position with multiple funding sources. Strong investor relationships across tier-1 VCs. Series B ready with exceptional metrics.'
    ],
    evidence: [
      ['$8M Series A funding secured from tier-1 VCs', 'Investor board representation established', 'Financial projections show path to profitability', 'Strong unit economics and growth metrics'],
      ['$8M Series A plus additional grants secured', 'Expanded investor relationships and board', 'Updated financial projections with improved metrics', 'Enhanced unit economics and growth tracking'],
      ['Comprehensive funding portfolio with multiple sources', 'Strong investor relationships across tier-1 VCs', 'Optimized financial projections and metrics', 'Exceptional unit economics and growth performance']
    ],
    nextSteps: [
      ['Prepare for Series B fundraising', 'Build strategic investor relationships', 'Optimize capital allocation'],
      ['Accelerate Series B fundraising preparation', 'Expand strategic investor relationships', 'Optimize capital allocation strategy'],
      ['Execute Series B fundraising strategy', 'Leverage strategic investor relationships', 'Maximize capital allocation efficiency']
    ]
  },
  'Sustainability': {
    justifications: [
      'Strong ESG framework with comprehensive sustainability metrics. Carbon footprint tracking implemented. Clear sustainability goals aligned with space industry standards.',
      'ESG framework enhanced with advanced sustainability metrics. Carbon footprint tracking optimized. Updated sustainability goals exceed industry standards.',
      'Industry-leading ESG framework with comprehensive metrics. Advanced carbon footprint tracking and reduction. Sustainability goals set new industry benchmarks.'
    ],
    evidence: [
      ['ESG framework document with comprehensive metrics', 'Carbon footprint tracking system implemented', 'Sustainability goals aligned with industry standards', 'ESG reporting framework established'],
      ['Enhanced ESG framework with advanced metrics', 'Optimized carbon footprint tracking system', 'Updated sustainability goals exceed standards', 'Advanced ESG reporting framework'],
      ['Industry-leading ESG framework with comprehensive metrics', 'Advanced carbon footprint tracking and reduction', 'Sustainability goals set new industry benchmarks', 'Comprehensive ESG reporting and disclosure']
    ],
    nextSteps: [
      ['Implement advanced sustainability tracking', 'Develop ESG reporting dashboard', 'Establish sustainability partnerships'],
      ['Deploy advanced sustainability tracking systems', 'Launch comprehensive ESG reporting dashboard', 'Execute sustainability partnership strategy'],
      ['Optimize sustainability tracking and reporting', 'Enhance ESG dashboard capabilities', 'Expand sustainability partnership ecosystem']
    ]
  },
  'System Integration': {
    justifications: [
      'Strong integration capabilities with major ground stations. API documentation complete. Partner integration testing successful.',
      'Integration capabilities expanded with additional ground stations. Enhanced API documentation and SDKs. Comprehensive partner integration testing completed.',
      'Industry-leading integration capabilities with extensive ground station network. Complete API documentation and developer tools. Thorough partner integration validation.'
    ],
    evidence: [
      ['Integration with 5 major ground stations completed', 'API documentation and SDKs available', 'Partner integration testing successful', 'System architecture supports scalable integration'],
      ['Integration with 7 major ground stations completed', 'Enhanced API documentation and advanced SDKs', 'Comprehensive partner integration testing', 'Optimized system architecture for scalability'],
      ['Integration with 10+ major ground stations completed', 'Complete API documentation and developer tools', 'Thorough partner integration validation', 'Advanced system architecture with full scalability']
    ],
    nextSteps: [
      ['Expand integration to additional ground stations', 'Develop advanced API features', 'Optimize integration performance'],
      ['Scale integration to global ground station network', 'Deploy advanced API features and capabilities', 'Optimize integration performance and reliability'],
      ['Maximize ground station integration coverage', 'Enhance API features and developer experience', 'Achieve optimal integration performance']
    ]
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ventureId, dimension } = body;

    if (!ventureId || !dimension) {
      return NextResponse.json({ error: 'ventureId and dimension required' }, { status: 400 });
    }

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
      // Create a submission if none exists
      const { data: newSubmission, error: createSubError } = await supabase
        .from('submissions')
        .insert({ venture_id: ventureId, status: 'completed' })
        .select()
        .single();

      if (createSubError) {
        console.error('Error creating submission:', createSubError);
        return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
      }

      // Use the new submission
      submission = newSubmission;
    }

    // Get the existing agent run to base variations on
    const { data: existingRun, error: runError } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('submission_id', submission.id)
      .eq('dimension', dimension)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (runError && runError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to find existing agent run' }, { status: 500 });
    }

    if (!existingRun) {
      // If no existing run, create initial analysis data
      const variations = analysisVariations[dimension as keyof typeof analysisVariations];
      if (!variations) {
        return NextResponse.json({ error: 'No variations available for this dimension' }, { status: 404 });
      }

      // Create initial agent run with base data
      const initialOutputJson = {
        justification: variations.justifications[0],
        evidence: variations.evidence[0],
        nextSteps: variations.nextSteps[0],
        confidence: 0.8,
        level: 6,
        recommendations: [
          {
            action: "Complete initial market research",
            impact: "high",
            reasoning: "Essential for validating product-market fit",
            eta_weeks: 4,
            dependency: "Market research team"
          },
          {
            action: "Establish key partnerships",
            impact: "medium", 
            reasoning: "Critical for market entry and customer acquisition",
            eta_weeks: 8,
            dependency: "Business development team"
          }
        ]
      };

      // Simulate processing time
      const duration = 1500 + Math.random() * 1000;

      // Create initial agent run
      const { data: newAgentRun, error: insertError } = await supabase
        .from('agent_runs')
        .insert({
          submission_id: submission.id,
          dimension: dimension,
          model: 'gpt-4',
          output_json: initialOutputJson,
          confidence: initialOutputJson.confidence,
          duration_ms: Math.round(duration),
          evidence_refs: [],
          flags: []
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting initial agent run:', insertError);
        return NextResponse.json({ error: 'Failed to create initial agent run' }, { status: 500 });
      }

      // Update the score to match the new analysis
      await supabase
        .from('scores')
        .upsert({
          venture_id: ventureId,
          dimension: dimension,
          level: initialOutputJson.level,
          confidence: initialOutputJson.confidence,
          updated_at: new Date().toISOString()
        }, { onConflict: 'venture_id,dimension' });

      return NextResponse.json({ 
        success: true, 
        newAgentRun,
        message: 'Initial analysis created successfully' 
      });
    }

    // Create a new agent run with slight variations
    const variations = analysisVariations[dimension as keyof typeof analysisVariations];
    const newOutputJson = { ...existingRun.output_json };

    if (variations) {
      // Ensure we get a different variation than the current one
      let randomIndex = Math.floor(Math.random() * variations.justifications.length);
      const currentJustification = existingRun.output_json.justification;
      
      // If we got the same justification, try again (max 3 attempts)
      let attempts = 0;
      while (variations.justifications[randomIndex] === currentJustification && attempts < 3) {
        randomIndex = Math.floor(Math.random() * variations.justifications.length);
        attempts++;
      }
      
      newOutputJson.justification = variations.justifications[randomIndex];
      newOutputJson.evidence = variations.evidence[randomIndex];
      newOutputJson.nextSteps = variations.nextSteps[randomIndex];
      
      // Slightly vary the confidence and level
      newOutputJson.confidence = Math.min(1, Math.max(0.5, (newOutputJson.confidence || 0.8) + (Math.random() - 0.5) * 0.1));
      newOutputJson.level = Math.min(9, Math.max(1, (newOutputJson.level || 6) + (Math.random() > 0.5 ? 1 : -1)));
    }

    // Simulate processing time
    const duration = 1500 + Math.random() * 1000;

    // Create new agent run
    const { data: newAgentRun, error: insertError } = await supabase
      .from('agent_runs')
      .insert({
        submission_id: submission.id,
        dimension: dimension,
        model: 'gpt-4',
        output_json: newOutputJson,
        confidence: newOutputJson.confidence,
        duration_ms: Math.round(duration),
        evidence_refs: existingRun.evidence_refs,
        flags: newOutputJson.confidence < 0.6 ? ['low_confidence'] : []
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting new agent run:', insertError);
      return NextResponse.json({ error: 'Failed to create new agent run' }, { status: 500 });
    }

    // Update the score to match the new analysis
    await supabase
      .from('scores')
      .upsert({
        venture_id: ventureId,
        dimension: dimension,
        level: newOutputJson.level,
        confidence: newOutputJson.confidence,
        updated_at: new Date().toISOString()
      }, { onConflict: 'venture_id,dimension' });

    return NextResponse.json({ 
      success: true, 
      newAgentRun,
      message: 'Analysis updated successfully' 
    });

  } catch (error) {
    console.error('Error in rerun analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

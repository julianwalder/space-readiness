export type AgentOutput = {
  dimension: string;
  level: number;          // 1-9
  confidence: number;     // 0-1
  justification: string;
  evidence: string[];     // Evidence found in documents
  nextSteps: string[];    // Immediate next steps
  recommendations: { action: string; impact: 'low'|'medium'|'high'; eta_weeks?: number; dependency?: string }[];
};

const clamp = (v: number, min=1, max=9) => Math.max(min, Math.min(max, v));

export async function runTechAgent(ctx: { stage?: string }) : Promise<AgentOutput> {
  const base = ctx.stage === 'series_a' ? 6 : ctx.stage === 'seed' ? 5 : 3;
  return {
    dimension: 'Technology',
    level: clamp(base),
    confidence: 0.7,
    justification: 'Prototype tested in relevant environment; certification plan pending.',
    evidence: [
      'Technical specifications document found',
      'Prototype test results mentioned',
      'Certification requirements outlined'
    ],
    nextSteps: [
      'Complete environmental testing protocol',
      'Submit for regulatory approval',
      'Finalize manufacturing specifications'
    ],
    recommendations: [{action: 'Complete TVAC & vibration test campaign', impact: 'high', eta_weeks: 8}]
  };
}

export async function runMarketAgent() : Promise<AgentOutput> {
  return {
    dimension: 'Customer/Market',
    level: 3,
    confidence: 0.6,
    justification: 'Discovery completed; no signed LoIs yet.',
    evidence: [
      'Market research presentation included',
      'Customer interviews documented',
      'Competitive analysis provided'
    ],
    nextSteps: [
      'Follow up on pending LOI discussions',
      'Validate pricing assumptions',
      'Expand market validation scope'
    ],
    recommendations: [
      {action: 'Secure 3 LoIs with target segments', impact: 'high', eta_weeks: 6},
      {action: 'Define pilot success metrics', impact: 'medium', eta_weeks: 2}
    ]
  };
}

export async function runBusinessAgent(): Promise<AgentOutput> {
  return {
    dimension: 'Business Model',
    level: 4, confidence: 0.55,
    justification: 'Unit economics baseline; pricing hypotheses unproven.',
    evidence: [
      'Business plan document included',
      'Revenue projections outlined',
      'Cost structure analysis provided'
    ],
    nextSteps: [
      'Validate pricing model with customers',
      'Refine unit economics',
      'Develop go-to-market strategy'
    ],
    recommendations: [{action: 'Run pricing tests with 5 prospects', impact: 'high', eta_weeks: 3}]
  };
}

export async function runTeamAgent(): Promise<AgentOutput> {
  return {
    dimension: 'Team',
    level: 5, confidence: 0.7,
    justification: 'Functional core team; missing senior commercial lead.',
    evidence: [
      'Team bios and resumes provided',
      'Organizational chart included',
      'Hiring plan outlined'
    ],
    nextSteps: [
      'Complete commercial hire search',
      'Define role responsibilities',
      'Establish team performance metrics'
    ],
    recommendations: [{action: 'Hire Head of Sales/BD', impact: 'high', eta_weeks: 10}]
  };
}

export async function runIPAgent(): Promise<AgentOutput> {
  return {
    dimension: 'IP',
    level: 2, confidence: 0.5,
    justification: 'No filings; FTO scan not completed.',
    evidence: [
      'IP strategy document referenced',
      'Patent landscape analysis incomplete',
      'Freedom to operate study needed'
    ],
    nextSteps: [
      'Complete FTO analysis',
      'File provisional patents',
      'Establish IP protection strategy'
    ],
    recommendations: [{action: 'Run FTO + file provisional patent', impact: 'high', eta_weeks: 4}]
  };
}

export async function runFundingAgent(): Promise<AgentOutput> {
  return {
    dimension: 'Funding',
    level: 4, confidence: 0.6,
    justification: 'Applied for grants; seed soft-circling missing.',
    evidence: [
      'Grant applications submitted',
      'Financial projections included',
      'Use of funds outlined'
    ],
    nextSteps: [
      'Prepare investor materials',
      'Build investor pipeline',
      'Complete due diligence package'
    ],
    recommendations: [{action: 'Assemble data room v1 + investor pipeline', impact: 'high', eta_weeks: 3}]
  };
}

export async function runSustainabilityAgent(): Promise<AgentOutput> {
  return {
    dimension: 'Sustainability',
    level: 5, confidence: 0.6,
    justification: 'ESG baseline mapped; KPIs tracking started.',
    evidence: [
      'ESG framework document included',
      'Sustainability metrics defined',
      'Environmental impact assessment provided'
    ],
    nextSteps: [
      'Implement ESG tracking system',
      'Set sustainability targets',
      'Develop reporting framework'
    ],
    recommendations: [{action: 'Set annual ESG targets; debris policy update', impact: 'medium', eta_weeks: 4}]
  };
}

export async function runIntegrationAgent(): Promise<AgentOutput> {
  return {
    dimension: 'System Integration',
    level: 2, confidence: 0.5,
    justification: 'Interfaces listed; no partner tests executed.',
    evidence: [
      'Integration requirements documented',
      'Partner interface specifications listed',
      'System architecture outlined'
    ],
    nextSteps: [
      'Execute partner integration tests',
      'Validate interface compatibility',
      'Document integration procedures'
    ],
    recommendations: [{action: 'Plan & execute integration tests with 1 partner', impact: 'high', eta_weeks: 6}]
  };
}

export async function runAllAgents(ctx: { stage?: string }) {
  return Promise.all([
    runTechAgent(ctx),
    runMarketAgent(),
    runBusinessAgent(),
    runTeamAgent(),
    runIPAgent(),
    runFundingAgent(),
    runSustainabilityAgent(),
    runIntegrationAgent(),
  ]);
}

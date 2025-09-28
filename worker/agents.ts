export type AgentOutput = {
  dimension: string;
  level: number;          // 1-9
  confidence: number;     // 0-1
  justification: string;
  evidence: string[];     // Evidence found in documents
  nextSteps: string[];    // Immediate next steps
  recommendations: { action: string; impact: 'low'|'medium'|'high'; eta_weeks?: number; dependency?: string }[];
};

// Import RAG service
import { generateEvidenceFromDocuments, generateRecommendationsFromDocuments } from '../src/lib/rag-service';

const clamp = (v: number, min=1, max=9) => Math.max(min, Math.min(max, v));

export async function runTechAgent(ctx: { 
  ventureId?: string;
  stage?: string; 
  technology_readiness_level?: number;
  has_prototype?: boolean;
  has_patents?: boolean;
  patent_count?: number;
  regulatory_requirements?: string[];
  certification_status?: string;
  product_type?: string;
}) : Promise<AgentOutput> {
  let base = 3; // Default for preseed
  
  // Adjust based on stage
  if (ctx.stage === 'series_a') base = 6;
  else if (ctx.stage === 'seed') base = 5;
  
  // Adjust based on TRL
  if (ctx.technology_readiness_level) {
    base = Math.max(base, Math.floor(ctx.technology_readiness_level / 2));
  }
  
  // Adjust based on prototype status
  if (ctx.has_prototype) base += 1;
  
  // Adjust based on patents
  if (ctx.has_patents && ctx.patent_count && ctx.patent_count > 0) {
    base += Math.min(2, Math.floor(ctx.patent_count / 2));
  }
  
  // Adjust based on certification status
  if (ctx.certification_status === 'completed') base += 2;
  else if (ctx.certification_status === 'in_progress') base += 1;
  
  const level = clamp(base);
  const confidence = ctx.technology_readiness_level ? 0.8 : 0.6;
  
  let justification = 'Technology assessment based on available information.';
  if (ctx.technology_readiness_level) {
    justification += ` TRL ${ctx.technology_readiness_level} indicates ${ctx.technology_readiness_level >= 7 ? 'advanced' : 'developing'} technology readiness.`;
  }
  if (ctx.has_prototype) {
    justification += ' Prototype development shows progress toward commercialization.';
  }
  if (ctx.has_patents && ctx.patent_count && ctx.patent_count > 0) {
    justification += ` ${ctx.patent_count} patent(s) demonstrate intellectual property protection.`;
  }
  
  // Generate evidence from documents if available
  let evidence: string[] = [];
  if (ctx.ventureId) {
    try {
      const documentEvidence = await generateEvidenceFromDocuments(ctx.ventureId, 'Technology', ctx);
      evidence = documentEvidence;
    } catch (error) {
      console.error('Error generating evidence from documents:', error);
      evidence = [
        'Technology readiness assessment completed',
        ctx.has_prototype ? 'Prototype development confirmed' : 'No prototype identified',
        ctx.has_patents ? 'Patent portfolio identified' : 'No patents filed',
        ctx.regulatory_requirements && ctx.regulatory_requirements.length > 0 
          ? `Regulatory requirements identified: ${ctx.regulatory_requirements.join(', ')}`
          : 'No regulatory requirements specified'
      ];
    }
  } else {
    evidence = [
      'Technology readiness assessment completed',
      ctx.has_prototype ? 'Prototype development confirmed' : 'No prototype identified',
      ctx.has_patents ? 'Patent portfolio identified' : 'No patents filed',
      ctx.regulatory_requirements && ctx.regulatory_requirements.length > 0 
        ? `Regulatory requirements identified: ${ctx.regulatory_requirements.join(', ')}`
        : 'No regulatory requirements specified'
    ];
  }
  
  const nextSteps = [
    'Complete technology validation testing',
    'Finalize regulatory compliance requirements',
    'Develop manufacturing specifications'
  ];
  
  if (ctx.certification_status !== 'completed') {
    nextSteps.push('Complete certification process');
  }
  
  // Generate recommendations from documents if available
  let recommendations: Array<{ action: string; impact: 'low'|'medium'|'high'; eta_weeks?: number; dependency?: string }> = [];
  
  if (ctx.ventureId) {
    try {
      const documentRecommendations = await generateRecommendationsFromDocuments(ctx.ventureId, 'Technology', ctx);
      recommendations = documentRecommendations;
    } catch (error) {
      console.error('Error generating recommendations from documents:', error);
      recommendations = [
        {action: 'Complete TRL validation testing', impact: 'high' as const, eta_weeks: 6},
        {action: 'File additional patents if applicable', impact: 'medium' as const, eta_weeks: 4}
      ];
      
      if (ctx.regulatory_requirements && ctx.regulatory_requirements.length > 0) {
        recommendations.push({
          action: `Complete ${ctx.regulatory_requirements.join(', ')} compliance`,
          impact: 'high' as const,
          eta_weeks: 8
        });
      }
    }
  } else {
    recommendations = [
      {action: 'Complete TRL validation testing', impact: 'high' as const, eta_weeks: 6},
      {action: 'File additional patents if applicable', impact: 'medium' as const, eta_weeks: 4}
    ];
    
    if (ctx.regulatory_requirements && ctx.regulatory_requirements.length > 0) {
      recommendations.push({
        action: `Complete ${ctx.regulatory_requirements.join(', ')} compliance`,
        impact: 'high' as const,
        eta_weeks: 8
      });
    }
  }
  
  return {
    dimension: 'Technology',
    level,
    confidence,
    justification,
    evidence,
    nextSteps,
    recommendations
  };
}

export async function runMarketAgent(ctx: {
  ventureId?: string;
  target_market?: string;
  target_customers?: string;
  customer_segments?: string[];
  market_size_estimate?: number;
  letters_of_intent?: number;
  pilot_customers?: number;
  customer_validation_method?: string;
  has_competitors?: boolean;
  competitive_advantage?: string;
  stage?: string;
}) : Promise<AgentOutput> {
  let base = 3; // Default for preseed
  
  // Adjust based on stage
  if (ctx.stage === 'series_a') base = 6;
  else if (ctx.stage === 'seed') base = 5;
  
  // Adjust based on market validation
  if (ctx.letters_of_intent && ctx.letters_of_intent > 0) {
    base += Math.min(3, ctx.letters_of_intent);
  }
  
  if (ctx.pilot_customers && ctx.pilot_customers > 0) {
    base += Math.min(2, ctx.pilot_customers);
  }
  
  // Adjust based on market size
  if (ctx.market_size_estimate && ctx.market_size_estimate > 1) {
    base += 1; // Bonus for large market
  }
  
  // Adjust based on customer validation method
  if (ctx.customer_validation_method === 'pilots') base += 2;
  else if (ctx.customer_validation_method === 'interviews') base += 1;
  
  const level = clamp(base);
  const confidence = ctx.letters_of_intent || ctx.pilot_customers ? 0.8 : 0.6;
  
  let justification = 'Market assessment based on available information.';
  if (ctx.target_market) {
    justification += ` Target market: ${ctx.target_market}.`;
  }
  if (ctx.letters_of_intent && ctx.letters_of_intent > 0) {
    justification += ` ${ctx.letters_of_intent} letter(s) of intent demonstrate market interest.`;
  }
  if (ctx.pilot_customers && ctx.pilot_customers > 0) {
    justification += ` ${ctx.pilot_customers} pilot customer(s) show market validation.`;
  }
  if (ctx.market_size_estimate && ctx.market_size_estimate > 0) {
    justification += ` Market size estimated at $${ctx.market_size_estimate}B.`;
  }
  
  // Generate evidence from documents if available
  let evidence: string[] = [];
  if (ctx.ventureId) {
    try {
      const documentEvidence = await generateEvidenceFromDocuments(ctx.ventureId, 'Customer/Market', ctx);
      evidence = documentEvidence;
    } catch (error) {
      console.error('Error generating evidence from documents:', error);
      evidence = [
        ctx.target_market ? `Target market identified: ${ctx.target_market}` : 'No target market specified',
        ctx.customer_segments && ctx.customer_segments.length > 0 
          ? `Customer segments: ${ctx.customer_segments.join(', ')}`
          : 'No customer segments specified',
        ctx.letters_of_intent && ctx.letters_of_intent > 0 
          ? `${ctx.letters_of_intent} letters of intent received`
          : 'No letters of intent',
        ctx.competitive_advantage ? 'Competitive advantage defined' : 'No competitive advantage specified'
      ];
    }
  } else {
    evidence = [
      ctx.target_market ? `Target market identified: ${ctx.target_market}` : 'No target market specified',
      ctx.customer_segments && ctx.customer_segments.length > 0 
        ? `Customer segments: ${ctx.customer_segments.join(', ')}`
        : 'No customer segments specified',
      ctx.letters_of_intent && ctx.letters_of_intent > 0 
        ? `${ctx.letters_of_intent} letters of intent received`
        : 'No letters of intent',
      ctx.competitive_advantage ? 'Competitive advantage defined' : 'No competitive advantage specified'
    ];
  }
  
  const nextSteps = [
    'Complete customer discovery interviews',
    'Validate market assumptions',
    'Develop go-to-market strategy'
  ];
  
  if (ctx.letters_of_intent === 0 || !ctx.letters_of_intent) {
    nextSteps.push('Secure letters of intent from target customers');
  }
  
  // Generate recommendations from documents if available
  let recommendations: Array<{ action: string; impact: 'low'|'medium'|'high'; eta_weeks?: number; dependency?: string }> = [];
  
  if (ctx.ventureId) {
    try {
      const documentRecommendations = await generateRecommendationsFromDocuments(ctx.ventureId, 'Customer/Market', ctx);
      recommendations = documentRecommendations;
    } catch (error) {
      console.error('Error generating recommendations from documents:', error);
      recommendations = [
        {action: 'Conduct comprehensive customer interviews', impact: 'high' as const, eta_weeks: 4},
        {action: 'Validate pricing through customer research', impact: 'medium' as const, eta_weeks: 3}
      ];
    }
  } else {
    recommendations = [
      {action: 'Conduct comprehensive customer interviews', impact: 'high' as const, eta_weeks: 4},
      {action: 'Validate pricing through customer research', impact: 'medium' as const, eta_weeks: 3}
    ];
  }
  
  if (ctx.letters_of_intent === 0 || !ctx.letters_of_intent) {
    recommendations.push({
      action: 'Secure 3+ letters of intent from target segments',
      impact: 'high' as const,
      eta_weeks: 6
    });
  }
  
  if (ctx.market_size_estimate && ctx.market_size_estimate < 1) {
    recommendations.push({
      action: 'Validate market size assumptions',
      impact: 'medium' as const,
      eta_weeks: 4
    });
  }
  
  return {
    dimension: 'Customer/Market',
    level,
    confidence,
    justification,
    evidence,
    nextSteps,
    recommendations
  };
}

export async function runBusinessAgent(ctx: {
  ventureId?: string;
  business_model?: string;
  revenue_model?: string;
  current_revenue?: number;
  customer_count?: number;
  has_paying_customers?: boolean;
  funding_raised?: number;
  months_to_runway?: number;
  stage?: string;
}) : Promise<AgentOutput> {
  let base = 3; // Default for preseed
  
  // Adjust based on stage
  if (ctx.stage === 'series_a') base = 6;
  else if (ctx.stage === 'seed') base = 5;
  
  // Adjust based on revenue
  if (ctx.current_revenue && ctx.current_revenue > 0) {
    if (ctx.current_revenue > 1000000) base += 3; // $1M+ ARR
    else if (ctx.current_revenue > 100000) base += 2; // $100K+ ARR
    else base += 1; // Some revenue
  }
  
  // Adjust based on paying customers
  if (ctx.has_paying_customers) base += 2;
  
  // Adjust based on customer count
  if (ctx.customer_count && ctx.customer_count > 0) {
    if (ctx.customer_count > 100) base += 2;
    else if (ctx.customer_count > 10) base += 1;
  }
  
  // Adjust based on funding
  if (ctx.funding_raised && ctx.funding_raised > 0) {
    if (ctx.funding_raised > 5000000) base += 2; // $5M+ raised
    else if (ctx.funding_raised > 1000000) base += 1; // $1M+ raised
  }
  
  // Adjust based on runway
  if (ctx.months_to_runway && ctx.months_to_runway > 12) base += 1;
  else if (ctx.months_to_runway && ctx.months_to_runway < 6) base -= 1;
  
  const level = clamp(base);
  const confidence = ctx.current_revenue || ctx.has_paying_customers ? 0.8 : 0.6;
  
  let justification = 'Business model assessment based on available information.';
  if (ctx.business_model) {
    justification += ` Business model: ${ctx.business_model}.`;
  }
  if (ctx.current_revenue && ctx.current_revenue > 0) {
    justification += ` Current revenue: $${ctx.current_revenue.toLocaleString()}.`;
  }
  if (ctx.has_paying_customers) {
    justification += ' Paying customers demonstrate market validation.';
  }
  if (ctx.customer_count && ctx.customer_count > 0) {
    justification += ` ${ctx.customer_count} customer(s) show market traction.`;
  }
  
  const evidence = [
    ctx.business_model ? `Business model: ${ctx.business_model}` : 'No business model specified',
    ctx.revenue_model ? `Revenue model: ${ctx.revenue_model}` : 'No revenue model specified',
    ctx.current_revenue && ctx.current_revenue > 0 
      ? `Current revenue: $${ctx.current_revenue.toLocaleString()}`
      : 'No revenue reported',
    ctx.has_paying_customers ? 'Paying customers confirmed' : 'No paying customers'
  ];
  
  const nextSteps = [
    'Validate pricing model with customers',
    'Refine unit economics',
    'Develop go-to-market strategy'
  ];
  
  if (!ctx.has_paying_customers) {
    nextSteps.push('Convert prospects to paying customers');
  }
  
  const recommendations = [
    {action: 'Validate pricing through customer research', impact: 'high' as const, eta_weeks: 4},
    {action: 'Develop customer acquisition strategy', impact: 'medium' as const, eta_weeks: 6}
  ];
  
  if (!ctx.has_paying_customers) {
    recommendations.push({
      action: 'Convert 3+ prospects to paying customers',
      impact: 'high' as const,
      eta_weeks: 8
    });
  }
  
  if (ctx.months_to_runway && ctx.months_to_runway < 12) {
    recommendations.push({
      action: 'Extend runway through revenue or funding',
      impact: 'high' as const,
      eta_weeks: 4
    });
  }
  
  return {
    dimension: 'Business Model',
    level,
    confidence,
    justification,
    evidence,
    nextSteps,
    recommendations
  };
}

export async function runTeamAgent(ctx: {
  ventureId?: string;
  team_size?: number;
  founders_count?: number;
  has_technical_cofounder?: boolean;
  has_business_cofounder?: boolean;
  team_experience_years?: number;
  previous_startups?: number;
  industry_experience?: string;
  key_team_members?: string;
  stage?: string;
}) : Promise<AgentOutput> {
  let base = 3; // Default for preseed
  
  // Adjust based on stage
  if (ctx.stage === 'series_a') base = 6;
  else if (ctx.stage === 'seed') base = 5;
  
  // Adjust based on team size
  if (ctx.team_size && ctx.team_size > 0) {
    if (ctx.team_size > 10) base += 2;
    else if (ctx.team_size > 5) base += 1;
  }
  
  // Adjust based on cofounders
  if (ctx.has_technical_cofounder) base += 1;
  if (ctx.has_business_cofounder) base += 1;
  
  // Adjust based on experience
  if (ctx.team_experience_years && ctx.team_experience_years > 0) {
    if (ctx.team_experience_years > 10) base += 2;
    else if (ctx.team_experience_years > 5) base += 1;
  }
  
  // Adjust based on previous startups
  if (ctx.previous_startups && ctx.previous_startups > 0) {
    base += Math.min(2, ctx.previous_startups);
  }
  
  // Adjust based on industry experience
  if (ctx.industry_experience === 'space' || ctx.industry_experience === 'aerospace') {
    base += 2; // Space industry experience is valuable
  } else if (ctx.industry_experience === 'defense' || ctx.industry_experience === 'tech') {
    base += 1;
  }
  
  const level = clamp(base);
  const confidence = ctx.team_size && ctx.team_size > 0 ? 0.8 : 0.6;
  
  let justification = 'Team assessment based on available information.';
  if (ctx.team_size && ctx.team_size > 0) {
    justification += ` Team size: ${ctx.team_size} members.`;
  }
  if (ctx.has_technical_cofounder && ctx.has_business_cofounder) {
    justification += ' Both technical and business cofounders present.';
  } else if (ctx.has_technical_cofounder || ctx.has_business_cofounder) {
    justification += ' Technical or business cofounder present.';
  }
  if (ctx.industry_experience) {
    justification += ` Industry experience: ${ctx.industry_experience}.`;
  }
  if (ctx.previous_startups && ctx.previous_startups > 0) {
    justification += ` ${ctx.previous_startups} previous startup(s) experience.`;
  }
  
  const evidence = [
    ctx.team_size && ctx.team_size > 0 
      ? `Team size: ${ctx.team_size} members`
      : 'No team size specified',
    ctx.has_technical_cofounder ? 'Technical cofounder present' : 'No technical cofounder',
    ctx.has_business_cofounder ? 'Business cofounder present' : 'No business cofounder',
    ctx.industry_experience 
      ? `Industry experience: ${ctx.industry_experience}`
      : 'No industry experience specified',
    ctx.key_team_members ? 'Key team members identified' : 'No key team members specified'
  ];
  
  const nextSteps = [
    'Complete team hiring plan',
    'Define role responsibilities',
    'Establish team performance metrics'
  ];
  
  if (!ctx.has_technical_cofounder && !ctx.has_business_cofounder) {
    nextSteps.push('Identify and recruit cofounders');
  }
  
  const recommendations = [
    {action: 'Develop comprehensive hiring plan', impact: 'high' as const, eta_weeks: 6},
    {action: 'Establish team performance metrics', impact: 'medium' as const, eta_weeks: 4}
  ];
  
  if (!ctx.has_technical_cofounder) {
    recommendations.push({
      action: 'Recruit technical cofounder or CTO',
      impact: 'high' as const,
      eta_weeks: 12
    });
  }
  
  if (!ctx.has_business_cofounder) {
    recommendations.push({
      action: 'Recruit business cofounder or CEO',
      impact: 'high' as const,
      eta_weeks: 12
    });
  }
  
  if (ctx.team_size && ctx.team_size < 5) {
    recommendations.push({
      action: 'Expand team to 5+ members',
      impact: 'medium' as const,
      eta_weeks: 8
    });
  }
  
  return {
    dimension: 'Team',
    level,
    confidence,
    justification,
    evidence,
    nextSteps,
    recommendations
  };
}

export async function runIPAgent(ctx: {
  ventureId?: string;
  has_patents?: boolean;
  patent_count?: number;
  product_type?: string;
  technology_readiness_level?: number;
  stage?: string;
}) : Promise<AgentOutput> {
  let base = 2; // Default low for IP
  
  // Adjust based on stage
  if (ctx.stage === 'series_a') base = 4;
  else if (ctx.stage === 'seed') base = 3;
  
  // Adjust based on patents
  if (ctx.has_patents && ctx.patent_count && ctx.patent_count > 0) {
    base += Math.min(3, ctx.patent_count);
  }
  
  // Adjust based on product type (hardware/software more IP intensive)
  if (ctx.product_type === 'hardware' || ctx.product_type === 'satellite') {
    base += 1;
  }
  
  // Adjust based on TRL (higher TRL suggests more developed IP)
  if (ctx.technology_readiness_level && ctx.technology_readiness_level > 6) {
    base += 1;
  }
  
  const level = clamp(base);
  const confidence = ctx.has_patents ? 0.8 : 0.5;
  
  let justification = 'IP assessment based on available information.';
  if (ctx.has_patents && ctx.patent_count && ctx.patent_count > 0) {
    justification += ` ${ctx.patent_count} patent(s) filed demonstrate IP protection.`;
  } else {
    justification += ' No patents filed yet.';
  }
  if (ctx.product_type) {
    justification += ` Product type: ${ctx.product_type}.`;
  }
  
  const evidence = [
    ctx.has_patents && ctx.patent_count && ctx.patent_count > 0 
      ? `${ctx.patent_count} patent(s) filed`
      : 'No patents filed',
    ctx.product_type ? `Product type: ${ctx.product_type}` : 'No product type specified',
    'IP strategy assessment completed'
  ];
  
  const nextSteps = [
    'Complete freedom to operate analysis',
    'Develop IP protection strategy',
    'File additional patents if applicable'
  ];
  
  if (!ctx.has_patents) {
    nextSteps.push('File provisional patents');
  }
  
  const recommendations = [
    {action: 'Complete freedom to operate analysis', impact: 'high' as const, eta_weeks: 4},
    {action: 'Develop comprehensive IP strategy', impact: 'medium' as const, eta_weeks: 6}
  ];
  
  if (!ctx.has_patents) {
    recommendations.push({
      action: 'File provisional patents for key innovations',
      impact: 'high' as const,
      eta_weeks: 4
    });
  }
  
  return {
    dimension: 'IP',
    level,
    confidence,
    justification,
    evidence,
    nextSteps,
    recommendations
  };
}

export async function runFundingAgent(ctx: {
  ventureId?: string;
  funding_raised?: number;
  funding_rounds?: number;
  months_to_runway?: number;
  current_revenue?: number;
  stage?: string;
}) : Promise<AgentOutput> {
  let base = 3; // Default for preseed
  
  // Adjust based on stage
  if (ctx.stage === 'series_a') base = 6;
  else if (ctx.stage === 'seed') base = 5;
  
  // Adjust based on funding raised
  if (ctx.funding_raised && ctx.funding_raised > 0) {
    if (ctx.funding_raised > 10000000) base += 3; // $10M+ raised
    else if (ctx.funding_raised > 5000000) base += 2; // $5M+ raised
    else if (ctx.funding_raised > 1000000) base += 1; // $1M+ raised
  }
  
  // Adjust based on funding rounds
  if (ctx.funding_rounds && ctx.funding_rounds > 0) {
    base += Math.min(2, ctx.funding_rounds);
  }
  
  // Adjust based on runway
  if (ctx.months_to_runway && ctx.months_to_runway > 18) base += 2;
  else if (ctx.months_to_runway && ctx.months_to_runway > 12) base += 1;
  else if (ctx.months_to_runway && ctx.months_to_runway < 6) base -= 2;
  
  // Adjust based on revenue (revenue reduces funding dependency)
  if (ctx.current_revenue && ctx.current_revenue > 0) {
    base += 1;
  }
  
  const level = clamp(base);
  const confidence = ctx.funding_raised && ctx.funding_raised > 0 ? 0.8 : 0.6;
  
  let justification = 'Funding assessment based on available information.';
  if (ctx.funding_raised && ctx.funding_raised > 0) {
    justification += ` $${ctx.funding_raised.toLocaleString()} raised demonstrates investor confidence.`;
  } else {
    justification += ' No funding raised yet.';
  }
  if (ctx.months_to_runway && ctx.months_to_runway > 0) {
    justification += ` Runway: ${ctx.months_to_runway} months.`;
  }
  if (ctx.current_revenue && ctx.current_revenue > 0) {
    justification += ` Revenue: $${ctx.current_revenue.toLocaleString()} reduces funding dependency.`;
  }
  
  const evidence = [
    ctx.funding_raised && ctx.funding_raised > 0 
      ? `$${ctx.funding_raised.toLocaleString()} raised`
      : 'No funding raised',
    ctx.funding_rounds && ctx.funding_rounds > 0 
      ? `${ctx.funding_rounds} funding round(s) completed`
      : 'No funding rounds completed',
    ctx.months_to_runway && ctx.months_to_runway > 0 
      ? `${ctx.months_to_runway} months runway`
      : 'No runway information',
    ctx.current_revenue && ctx.current_revenue > 0 
      ? `$${ctx.current_revenue.toLocaleString()} revenue`
      : 'No revenue reported'
  ];
  
  const nextSteps = [
    'Prepare investor materials',
    'Build investor pipeline',
    'Complete due diligence package'
  ];
  
  if (ctx.months_to_runway && ctx.months_to_runway < 12) {
    nextSteps.push('Secure additional funding');
  }
  
  const recommendations = [
    {action: 'Develop comprehensive investor materials', impact: 'high' as const, eta_weeks: 4},
    {action: 'Build strategic investor relationships', impact: 'medium' as const, eta_weeks: 8}
  ];
  
  if (!ctx.funding_raised || ctx.funding_raised === 0) {
    recommendations.push({
      action: 'Raise initial funding round',
      impact: 'high' as const,
      eta_weeks: 12
    });
  }
  
  if (ctx.months_to_runway && ctx.months_to_runway < 12) {
    recommendations.push({
      action: 'Extend runway through funding or revenue',
      impact: 'high' as const,
      eta_weeks: 6
    });
  }
  
  return {
    dimension: 'Funding',
    level,
    confidence,
    justification,
    evidence,
    nextSteps,
    recommendations
  };
}

export async function runSustainabilityAgent(ctx: {
  ventureId?: string;
  stage?: string;
  product_type?: string;
  company_age_months?: number;
}) : Promise<AgentOutput> {
  let base = 3; // Default for preseed
  
  // Adjust based on stage
  if (ctx.stage === 'series_a') base = 6;
  else if (ctx.stage === 'seed') base = 5;
  
  // Adjust based on company age (older companies have more ESG maturity)
  if (ctx.company_age_months && ctx.company_age_months > 24) base += 1;
  
  // Adjust based on product type (space hardware has higher sustainability requirements)
  if (ctx.product_type === 'satellite' || ctx.product_type === 'hardware') {
    base += 1;
  }
  
  const level = clamp(base);
  const confidence = 0.6;
  
  let justification = 'Sustainability assessment based on available information.';
  if (ctx.product_type) {
    justification += ` Product type: ${ctx.product_type}.`;
  }
  if (ctx.company_age_months && ctx.company_age_months > 0) {
    justification += ` Company age: ${Math.floor(ctx.company_age_months / 12)} years.`;
  }
  
  const evidence = [
    'ESG framework assessment completed',
    ctx.product_type ? `Product type: ${ctx.product_type}` : 'No product type specified',
    ctx.company_age_months && ctx.company_age_months > 0 
      ? `Company age: ${Math.floor(ctx.company_age_months / 12)} years`
      : 'No company age specified'
  ];
  
  const nextSteps = [
    'Implement ESG tracking system',
    'Set sustainability targets',
    'Develop reporting framework'
  ];
  
  const recommendations = [
    {action: 'Develop comprehensive ESG framework', impact: 'medium' as const, eta_weeks: 6},
    {action: 'Implement sustainability metrics tracking', impact: 'medium' as const, eta_weeks: 4}
  ];
  
  if (ctx.product_type === 'satellite') {
    recommendations.push({
      action: 'Develop space debris mitigation strategy',
      impact: 'medium' as const,
      eta_weeks: 8
    });
  }
  
  return {
    dimension: 'Sustainability',
    level,
    confidence,
    justification,
    evidence,
    nextSteps,
    recommendations
  };
}

export async function runIntegrationAgent(ctx: {
  ventureId?: string;
  key_partnerships?: string;
  product_type?: string;
  technology_readiness_level?: number;
  stage?: string;
}) : Promise<AgentOutput> {
  let base = 2; // Default low for integration
  
  // Adjust based on stage
  if (ctx.stage === 'series_a') base = 4;
  else if (ctx.stage === 'seed') base = 3;
  
  // Adjust based on partnerships
  if (ctx.key_partnerships && ctx.key_partnerships.length > 0) {
    base += 2; // Partnerships indicate integration capability
  }
  
  // Adjust based on product type (software/hardware more integration intensive)
  if (ctx.product_type === 'software' || ctx.product_type === 'ground_system') {
    base += 1;
  }
  
  // Adjust based on TRL (higher TRL suggests more integration testing)
  if (ctx.technology_readiness_level && ctx.technology_readiness_level > 6) {
    base += 1;
  }
  
  const level = clamp(base);
  const confidence = ctx.key_partnerships ? 0.7 : 0.5;
  
  let justification = 'Integration assessment based on available information.';
  if (ctx.key_partnerships && ctx.key_partnerships.length > 0) {
    justification += ' Key partnerships identified.';
  } else {
    justification += ' No key partnerships specified.';
  }
  if (ctx.product_type) {
    justification += ` Product type: ${ctx.product_type}.`;
  }
  
  const evidence = [
    ctx.key_partnerships && ctx.key_partnerships.length > 0 
      ? 'Key partnerships identified'
      : 'No partnerships specified',
    ctx.product_type ? `Product type: ${ctx.product_type}` : 'No product type specified',
    'Integration requirements assessment completed'
  ];
  
  const nextSteps = [
    'Execute partner integration tests',
    'Validate interface compatibility',
    'Document integration procedures'
  ];
  
  if (!ctx.key_partnerships) {
    nextSteps.push('Develop key partnerships');
  }
  
  const recommendations = [
    {action: 'Develop integration testing framework', impact: 'high' as const, eta_weeks: 6},
    {action: 'Document integration procedures', impact: 'medium' as const, eta_weeks: 4}
  ];
  
  if (!ctx.key_partnerships) {
    recommendations.push({
      action: 'Establish key strategic partnerships',
      impact: 'high' as const,
      eta_weeks: 12
    });
  }
  
  return {
    dimension: 'System Integration',
    level,
    confidence,
    justification,
    evidence,
    nextSteps,
    recommendations
  };
}

export async function runAllAgents(ctx: { 
  ventureId?: string;
  stage?: string;
  // Technology fields
  technology_readiness_level?: number;
  has_prototype?: boolean;
  has_patents?: boolean;
  patent_count?: number;
  regulatory_requirements?: string[];
  certification_status?: string;
  product_type?: string;
  // Market fields
  target_market?: string;
  target_customers?: string;
  customer_segments?: string[];
  market_size_estimate?: number;
  letters_of_intent?: number;
  pilot_customers?: number;
  customer_validation_method?: string;
  has_competitors?: boolean;
  competitive_advantage?: string;
  // Business fields
  business_model?: string;
  revenue_model?: string;
  current_revenue?: number;
  customer_count?: number;
  has_paying_customers?: boolean;
  funding_raised?: number;
  funding_rounds?: number;
  months_to_runway?: number;
  // Team fields
  team_size?: number;
  founders_count?: number;
  has_technical_cofounder?: boolean;
  has_business_cofounder?: boolean;
  team_experience_years?: number;
  previous_startups?: number;
  industry_experience?: string;
  key_team_members?: string;
  // Operational fields
  company_age_months?: number;
  key_partnerships?: string;
}) {
  return Promise.all([
    runTechAgent({
      ventureId: ctx.ventureId,
      stage: ctx.stage,
      technology_readiness_level: ctx.technology_readiness_level,
      has_prototype: ctx.has_prototype,
      has_patents: ctx.has_patents,
      patent_count: ctx.patent_count,
      regulatory_requirements: ctx.regulatory_requirements,
      certification_status: ctx.certification_status,
      product_type: ctx.product_type
    }),
    runMarketAgent({
      ventureId: ctx.ventureId,
      stage: ctx.stage,
      target_market: ctx.target_market,
      target_customers: ctx.target_customers,
      customer_segments: ctx.customer_segments,
      market_size_estimate: ctx.market_size_estimate,
      letters_of_intent: ctx.letters_of_intent,
      pilot_customers: ctx.pilot_customers,
      customer_validation_method: ctx.customer_validation_method,
      has_competitors: ctx.has_competitors,
      competitive_advantage: ctx.competitive_advantage
    }),
    runBusinessAgent({
      ventureId: ctx.ventureId,
      stage: ctx.stage,
      business_model: ctx.business_model,
      revenue_model: ctx.revenue_model,
      current_revenue: ctx.current_revenue,
      customer_count: ctx.customer_count,
      has_paying_customers: ctx.has_paying_customers,
      funding_raised: ctx.funding_raised,
      months_to_runway: ctx.months_to_runway
    }),
    runTeamAgent({
      ventureId: ctx.ventureId,
      stage: ctx.stage,
      team_size: ctx.team_size,
      founders_count: ctx.founders_count,
      has_technical_cofounder: ctx.has_technical_cofounder,
      has_business_cofounder: ctx.has_business_cofounder,
      team_experience_years: ctx.team_experience_years,
      previous_startups: ctx.previous_startups,
      industry_experience: ctx.industry_experience,
      key_team_members: ctx.key_team_members
    }),
    runIPAgent({
      ventureId: ctx.ventureId,
      stage: ctx.stage,
      has_patents: ctx.has_patents,
      patent_count: ctx.patent_count,
      product_type: ctx.product_type,
      technology_readiness_level: ctx.technology_readiness_level
    }),
    runFundingAgent({
      ventureId: ctx.ventureId,
      stage: ctx.stage,
      funding_raised: ctx.funding_raised,
      funding_rounds: ctx.funding_rounds,
      months_to_runway: ctx.months_to_runway,
      current_revenue: ctx.current_revenue
    }),
    runSustainabilityAgent({
      ventureId: ctx.ventureId,
      stage: ctx.stage,
      product_type: ctx.product_type,
      company_age_months: ctx.company_age_months
    }),
    runIntegrationAgent({
      ventureId: ctx.ventureId,
      stage: ctx.stage,
      key_partnerships: ctx.key_partnerships,
      product_type: ctx.product_type,
      technology_readiness_level: ctx.technology_readiness_level
    }),
  ]);
}

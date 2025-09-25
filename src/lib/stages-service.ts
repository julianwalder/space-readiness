import { supabase } from './supabaseClient';

export interface Stage {
  id: string;
  name: string;
  description: string;
  purpose: string;
  sources: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

// Cache for stages to avoid repeated API calls
let stagesCache: Stage[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getStages(): Promise<Stage[]> {
  // Return cached data if it's still fresh
  if (stagesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return stagesCache;
  }

  try {
    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching stages:', error);
      // Return fallback data if database is unavailable
      return getFallbackStages();
    }

    if (!data || data.length === 0) {
      console.warn('No stages found in database, using fallback data');
      return getFallbackStages();
    }

    // Update cache
    stagesCache = data;
    cacheTimestamp = Date.now();

    return data;
  } catch (error) {
    console.error('Error fetching stages:', error);
    // Return fallback data if there's an error
    return getFallbackStages();
  }
}

// Fallback stages in case database is unavailable
function getFallbackStages(): Stage[] {
  return [
    {
      id: 'pre_seed',
      name: 'Pre-Seed',
      description: 'Initial funding stage to cover early startup costs',
      purpose: 'To cover initial costs like market research, business plan development, and early product prototypes.',
      sources: 'Often comes from the founder\'s own funds, friends, family, or angel investors.',
      display_order: 1
    },
    {
      id: 'seed',
      name: 'Seed',
      description: 'Early-stage funding for product development and market validation',
      purpose: 'To fund initial product development, conduct market research, and test business models.',
      sources: 'Primarily angel investors, incubators, or accelerators.',
      display_order: 2
    },
    {
      id: 'series_a',
      name: 'Series A',
      description: 'First institutional round to scale the business',
      purpose: 'To refine the business model and achieve significant market traction and revenue potential.',
      sources: 'Typically the first institutional round of venture capital after seed and angel investors.',
      display_order: 3
    }
  ];
}

export function getStageById(id: string): Stage | null {
  const stages = stagesCache || getFallbackStages();
  return stages.find(stage => stage.id === id) || null;
}

export function getStageByName(name: string): Stage | null {
  const stages = stagesCache || getFallbackStages();
  return stages.find(stage => stage.name === name) || null;
}

// Clear cache when stages are updated
export function clearStagesCache(): void {
  stagesCache = null;
  cacheTimestamp = 0;
}

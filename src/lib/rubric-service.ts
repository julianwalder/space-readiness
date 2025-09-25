import { supabase } from '@/lib/supabaseClient';

export type Dimension =
  | 'Technology'
  | 'Customer/Market'
  | 'Business Model'
  | 'Team'
  | 'IP'
  | 'Funding'
  | 'Sustainability'
  | 'System Integration';

export type Level = 1|2|3|4|5|6|7|8|9;

export const DIMENSIONS: Readonly<Dimension[]> = [
  'Technology',
  'Customer/Market',
  'Business Model',
  'Team',
  'IP',
  'Funding',
  'Sustainability',
  'System Integration',
] as const;

type LevelMap = Record<Level, string>;

// Cache for rubric data to avoid repeated database calls
let rubricCache: Record<Dimension, LevelMap> | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (longer cache)
let isLoading = false;
let loadPromise: Promise<Record<Dimension, LevelMap>> | null = null;

/**
 * Fetches all rubric data from Supabase
 */
async function fetchRubricData(): Promise<Record<Dimension, LevelMap>> {
  try {
    const { data, error } = await supabase
      .from('rubric')
      .select('dimension, level_descriptions');

    if (error) {
      console.error('Error fetching rubric data:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No rubric data found');
    }

    // Transform the data into the expected format
    const rubric: Record<Dimension, LevelMap> = {} as Record<Dimension, LevelMap>;
    
    for (const row of data) {
      const dimension = row.dimension as Dimension;
      const levelDescriptions = row.level_descriptions as Record<string, string>;
      
      // Convert string keys to numbers and ensure proper typing
      const levelMap: LevelMap = {} as LevelMap;
      for (let i = 1; i <= 9; i++) {
        const level = i as Level;
        levelMap[level] = levelDescriptions[i.toString()] || '';
      }
      
      rubric[dimension] = levelMap;
    }

    return rubric;
  } catch (error) {
    console.error('Failed to fetch rubric data:', error);
    throw error;
  }
}

/**
 * Gets rubric data with caching
 */
export async function getRubricData(): Promise<Record<Dimension, LevelMap>> {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (rubricCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return rubricCache;
  }

  // If already loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;
  loadPromise = fetchRubricData();
  
  try {
    rubricCache = await loadPromise;
    cacheTimestamp = now;
    return rubricCache;
  } finally {
    isLoading = false;
    loadPromise = null;
  }
}

/**
 * Gets a specific level description for a dimension
 */
export async function getLevelDesc(dimension: Dimension, level: Level): Promise<string> {
  const rubric = await getRubricData();
  return rubric[dimension]?.[level] || '';
}

/**
 * Gets all level descriptions for a specific dimension
 */
export async function getDimensionLevels(dimension: Dimension): Promise<LevelMap> {
  const rubric = await getRubricData();
  return rubric[dimension] || {} as LevelMap;
}

/**
 * Clears the rubric cache (useful for admin updates)
 */
export function clearRubricCache(): void {
  rubricCache = null;
  cacheTimestamp = null;
  isLoading = false;
  loadPromise = null;
}

/**
 * Preloads all rubric data to avoid loading states during navigation
 */
export async function preloadRubricData(): Promise<void> {
  try {
    await getRubricData();
  } catch (error) {
    console.error('Failed to preload rubric data:', error);
    // Don't throw - let individual components handle the error
  }
}

/**
 * Gets rubric data synchronously if available in cache
 */
export function getRubricDataSync(): Record<Dimension, LevelMap> | null {
  const now = Date.now();
  
  if (rubricCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return rubricCache;
  }
  
  return null;
}

/**
 * Updates a level description in Supabase (admin function)
 */
export async function updateLevelDescription(
  dimension: Dimension, 
  level: Level, 
  description: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('rubric')
      .update({
        level_descriptions: supabase.raw(`jsonb_set(level_descriptions, '{${level}}', '"${description}"')`)
      })
      .eq('dimension', dimension);

    if (error) {
      console.error('Error updating level description:', error);
      throw error;
    }

    // Clear cache to force refresh
    clearRubricCache();
  } catch (error) {
    console.error('Failed to update level description:', error);
    throw error;
  }
}

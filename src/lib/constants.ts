export const DIMENSIONS = [
  'Technology',
  'Customer/Market', 
  'Team',
  'Business Model',
  'Sustainability',
  'Funding',
  'IP',
  'System Integration'
] as const;

export type Dimension = typeof DIMENSIONS[number];

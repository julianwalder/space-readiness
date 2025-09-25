'use client';

import { useEffect } from 'react';
import { preloadRubricData } from '@/lib/rubric-service';

export default function RubricPreloader() {
  useEffect(() => {
    // Preload rubric data when the app starts
    preloadRubricData();
  }, []);

  // This component doesn't render anything
  return null;
}

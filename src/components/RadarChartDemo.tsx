'use client';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DIMENSIONS } from '@/lib/constants';

type Score = { dimension: string; level: number; confidence: number };

export default function RadarChartDemo() {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);

  // Generate random scores for demo - keep dimensions in consistent order
  const generateRandomScores = useCallback(() => {
    return DIMENSIONS.map(dimension => ({
      dimension,
      level: Math.floor(Math.random() * 4) + 4, // Random between 4-7
      confidence: Math.random() * 0.4 + 0.6 // Random between 0.6-1.0
    }));
  }, []);

  useEffect(() => {
    // Initial load
    setScores(generateRandomScores());
    setIsLoading(false);

    // Update scores every 4 seconds to show dynamic behavior (less frequent)
    const interval = setInterval(() => {
      setScores(prevScores => {
        // Only update if we have previous scores to prevent flickering
        if (prevScores.length > 0) {
          return generateRandomScores();
        }
        return prevScores;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [generateRandomScores]);

  // Ensure consistent data format for radar chart - always in DIMENSIONS order
  const radarData = useMemo(() => {
    return DIMENSIONS.map(dimension => {
      const score = scores.find(s => s.dimension === dimension);
      return {
        subject: dimension,
        A: score?.level || 5 // fallback to 5 if not found
      };
    });
  }, [scores]);

  if (isLoading) {
    return (
      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-2 text-sm text-gray-600">Loading demo...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className="w-full aspect-square">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          data={radarData} 
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 10, fill: '#374151' }}
            tickLine={{ stroke: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <PolarRadiusAxis 
            domain={[1, 9]} 
            tick={false}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickCount={9}
          />
          <Radar 
            name="Level" 
            dataKey="A" 
            stroke="#2563eb" 
            fill="#3b82f6" 
            fillOpacity={0.4}
            strokeWidth={2}
            animationDuration={1500}
            animationEasing="ease-in-out"
            isAnimationActive={true}
            dot={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

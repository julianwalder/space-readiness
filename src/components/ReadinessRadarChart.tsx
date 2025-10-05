'use client';
import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DIMENSIONS } from '@/lib/constants';

type Score = { 
  dimension: string; 
  level: number; 
  confidence: number; 
};

interface ReadinessRadarChartProps {
  scores: Score[];
  height?: string;
}

export default function ReadinessRadarChart({ scores }: ReadinessRadarChartProps) {
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
      <div className="h-96 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: 12, fill: '#374151' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <PolarRadiusAxis 
              domain={[1, 9]} 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={{ stroke: '#9ca3af' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Radar 
              name="Level" 
              dataKey="A" 
              stroke="#2563eb" 
              fill="#3b82f6" 
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        {scores.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white/80 rounded-lg p-4 border border-gray-200" style={{WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)'}}>
              <div className="text-sm font-medium text-gray-600">No Assessments Yet</div>
              <div className="text-xs text-gray-500 mt-1">
                Complete assessments to see your actual readiness scores
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

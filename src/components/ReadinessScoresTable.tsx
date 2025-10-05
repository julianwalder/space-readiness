'use client';
import { DIMENSIONS } from '@/lib/constants';

type Score = { 
  dimension: string; 
  level: number; 
  confidence: number; 
};

interface ReadinessScoresTableProps {
  scores: Score[];
  title?: string;
}

export default function ReadinessScoresTable({ scores, title = "Current Scores" }: ReadinessScoresTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        {/* Table Header */}
        <div className="grid grid-cols-3 items-center py-2 px-3 bg-gray-100 rounded mb-2">
          <div className="text-sm font-semibold text-gray-700">Dimension</div>
          <div className="text-center text-sm font-semibold text-gray-700">Score</div>
          <div className="text-right text-sm font-semibold text-gray-700">Confidence</div>
        </div>
        {/* All Dimensions - with real scores where available */}
        <div className="space-y-1">
          {DIMENSIONS.map((dimension) => {
            const score = scores.find(s => s.dimension === dimension);
            return (
              <div key={dimension} className="grid grid-cols-3 items-center py-2 px-3 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-900">{dimension}</div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {score ? `${score.level}` : '--'}<span className="text-xs text-gray-500">/9</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">
                    {score ? `${Math.round(score.confidence * 100)}%` : '--%'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

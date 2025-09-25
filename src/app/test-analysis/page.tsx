'use client';

import { useVenture } from '@/contexts/VentureContext';
import EnhancedDimensionCard from '@/components/EnhancedDimensionCard';

export default function TestAnalysisPage() {
  const { currentVenture } = useVenture();

  if (!currentVenture) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Analysis Page</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please select a venture first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Analysis Page</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Testing enhanced analysis for: <strong>{currentVenture.name}</strong>
        </p>
        <p className="text-xs text-gray-500">
          Venture ID: {currentVenture.id}
        </p>
      </div>

      <EnhancedDimensionCard
        dimension="Technology"
        scores={[]}
        title="Technology Readiness Test"
        description="Testing the enhanced dimension card component"
      />
    </div>
  );
}

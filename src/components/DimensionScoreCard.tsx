'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLevelDesc, getRubricDataSync, preloadRubricData, type Dimension, type Level } from '@/lib/rubric-service';

type Score = { dimension: string; level: number; confidence: number };

interface DimensionScoreCardProps {
  dimension: Dimension;
  scores: Score[];
  title: string;
  description: string;
}

export default function DimensionScoreCard({ dimension, scores, title, description }: DimensionScoreCardProps) {
  const currentScore = scores.length > 0 ? scores[0] : null;
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [levelDescriptions, setLevelDescriptions] = useState<Record<Level, string>>({} as Record<Level, string>);
  const [isLoadingDescriptions, setIsLoadingDescriptions] = useState(true);

  // Load level descriptions from Supabase
  useEffect(() => {
    const loadLevelDescriptions = async () => {
      try {
        // First try to get data synchronously from cache
        const cachedRubric = getRubricDataSync();
        if (cachedRubric && cachedRubric[dimension]) {
          setLevelDescriptions(cachedRubric[dimension]);
          setIsLoadingDescriptions(false);
          return;
        }

        // If not in cache, load asynchronously
        setIsLoadingDescriptions(true);
        const descriptions: Record<Level, string> = {} as Record<Level, string>;
        
        // Load all level descriptions for this dimension
        for (let i = 1; i <= 9; i++) {
          const level = i as Level;
          descriptions[level] = await getLevelDesc(dimension, level);
        }
        
        setLevelDescriptions(descriptions);
      } catch (error) {
        console.error('Error loading level descriptions:', error);
        // Fallback to empty descriptions
        setLevelDescriptions({} as Record<Level, string>);
      } finally {
        setIsLoadingDescriptions(false);
      }
    };

    loadLevelDescriptions();
  }, [dimension]);

  return (
    <div className="mb-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">
          {description}
        </p>
        
        {/* Progress Bar with Segments */}
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="relative">
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-900">Readiness Progress</div>
            </div>
            
            {/* Segmented Progress Bar */}
            <div className="flex h-12 bg-gray-200 rounded-lg overflow-hidden">
              {([1,2,3,4,5,6,7,8,9] as Level[]).map((level) => {
                const isCurrentLevel = currentScore && currentScore.level === level;
                const isCompleted = currentScore && currentScore.level > level;
                const isFuture = !currentScore || currentScore.level < level;
                
                return (
                  <div
                    key={level}
                    className={`
                      flex-1 flex items-center justify-center relative transition-all duration-200 cursor-pointer
                      ${isCurrentLevel 
                        ? 'bg-gray-900' 
                        : isCompleted 
                          ? 'bg-gray-600' 
                          : 'bg-gray-200'
                      }
                    `}
                    title={levelDescriptions[level] || `Level ${level}`}
                  >
                    {/* Level Number */}
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                      ${isCurrentLevel 
                        ? 'border-white bg-white text-gray-900' 
                        : isCompleted 
                          ? 'border-gray-200 bg-gray-200 text-gray-900' 
                          : 'border-gray-400 bg-gray-100 text-gray-500'
                      }
                    `}>
                      {level}
                    </div>
                    
                    {/* Current Level Indicator */}
                    {isCurrentLevel && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Level Labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Level 1</span>
              <span>Level 9</span>
            </div>
          </div>

          {/* Current Level Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Level Number with Confidence Ring */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {/* Confidence Ring */}
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-300"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-gray-600"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${currentScore ? currentScore.confidence * 100 : 0}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    
                    {/* Level Number or TBD */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`font-bold ${currentScore ? 'text-4xl text-gray-900' : 'text-2xl text-gray-500'}`}>
                        {currentScore ? currentScore.level : 'TBD'}
                      </span>
                    </div>
                  </div>
                  
                </div>
                
                <div className="text-sm text-gray-700 max-w-md">
                  <strong>Current Status:</strong> {
                    currentScore 
                      ? (levelDescriptions[currentScore.level as Level] || `Level ${currentScore.level}`)
                      : 'Pre-evaluation, data needs to be fed into the system'
                  }
                  <div className="text-xs text-gray-500 mt-1">
                    {currentScore ? `${Math.round(currentScore.confidence * 100)}% Confidence` : '0% Confidence'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAllLevels(!showAllLevels)}
                className="inline-flex items-center px-3 py-2 border border-gray-900 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 transition-colors"
              >
                {showAllLevels ? 'Hide All' : 'View All'}
              </button>
            </div>
          </div>

          {/* Level Descriptions */}
          {showAllLevels && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">All Level Descriptions</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {([1,2,3,4,5,6,7,8,9] as Level[]).map((level) => {
                  const isCurrentLevel = currentScore && currentScore.level === level;
                  const isCompleted = currentScore && currentScore.level > level;
                  
                  return (
                    <div
                      key={level}
                      className={`
                        p-3 rounded-md border text-xs
                        ${isCurrentLevel 
                          ? 'border-gray-900 bg-gray-900 text-white' 
                          : isCompleted 
                            ? 'border-gray-600 bg-gray-600 text-white' 
                            : 'border-gray-200 bg-white text-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-start space-x-2">
                        <div className={`
                          flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                          ${isCurrentLevel 
                            ? 'border-white bg-white text-gray-900' 
                            : isCompleted 
                              ? 'border-gray-200 bg-gray-200 text-gray-900' 
                              : 'border-gray-400 bg-gray-100 text-gray-600'
                          }
                        `}>
                          {level}
                        </div>
                        <div className="text-xs leading-relaxed">
                          {levelDescriptions[level] || `Level ${level}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

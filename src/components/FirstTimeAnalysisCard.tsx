'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FirstTimeAnalysisCardProps {
  dimension: string;
  title: string;
  description: string;
  onStartAnalysis: () => void;
  isRunning?: boolean;
  hasFiles?: boolean;
}

export default function FirstTimeAnalysisCard({
  dimension,
  title,
  description,
  onStartAnalysis,
  isRunning = false,
  hasFiles = false
}: FirstTimeAnalysisCardProps) {
  // Dimension-specific preview data
  const getDimensionPreviewData = (dimension: string) => {
    const previewData = {
      'Customer/Market': {
        rationale: "Based on the available business documentation, the venture demonstrates strong market awareness with identified target segments and customer pain points. However, there are opportunities to strengthen competitive positioning and market validation through deeper customer research.",
        evidence: [
          "Target customer segments clearly defined in business plan",
          "Customer pain points identified and validated through initial research",
          "Market size and opportunity quantified with growth projections"
        ],
        nextSteps: [
          "Conduct comprehensive customer interviews across all segments",
          "Validate market assumptions through competitive analysis",
          "Develop detailed customer personas and journey mapping"
        ],
        recommendations: [
          {
            action: "Conduct 50+ customer discovery interviews",
            impact: "high impact",
            timeline: "3-4 weeks",
            dependency: "Customer contact database"
          },
          {
            action: "Complete competitive landscape analysis",
            impact: "medium impact", 
            timeline: "2 weeks"
          },
          {
            action: "Validate pricing through customer willingness-to-pay studies",
            impact: "medium impact",
            timeline: "2-3 weeks"
          }
        ]
      },
      'Technology': {
        rationale: "The venture shows solid technical foundation with clear technology stack and development roadmap. However, there are opportunities to strengthen technical architecture documentation and scalability planning to improve overall readiness.",
        evidence: [
          "Technology stack clearly defined and justified",
          "Development roadmap with realistic milestones",
          "Technical architecture documented with scalability considerations"
        ],
        nextSteps: [
          "Complete detailed technical architecture documentation",
          "Implement comprehensive testing and quality assurance processes",
          "Develop technical risk mitigation strategies"
        ],
        recommendations: [
          {
            action: "Create comprehensive technical architecture documentation",
            impact: "high impact",
            timeline: "2-3 weeks"
          },
          {
            action: "Implement automated testing and CI/CD pipeline",
            impact: "medium impact",
            timeline: "3-4 weeks"
          },
          {
            action: "Develop technical risk assessment and mitigation plan",
            impact: "medium impact",
            timeline: "1-2 weeks"
          }
        ]
      },
      'Business Model': {
        rationale: "The venture demonstrates a well-structured business model with clear revenue streams and value proposition. However, there are opportunities to strengthen financial projections and operational scalability planning.",
        evidence: [
          "Revenue model clearly defined with multiple income streams",
          "Value proposition aligned with customer needs and market demand",
          "Business model canvas completed with key partnerships identified"
        ],
        nextSteps: [
          "Develop detailed 3-year financial projections with scenario planning",
          "Validate unit economics through pilot programs",
          "Create operational scalability roadmap"
        ],
        recommendations: [
          {
            action: "Develop comprehensive financial model with sensitivity analysis",
            impact: "high impact",
            timeline: "2-3 weeks"
          },
          {
            action: "Validate unit economics through pilot customer acquisition",
            impact: "medium impact",
            timeline: "4-6 weeks"
          },
          {
            action: "Create operational scaling playbook",
            impact: "medium impact",
            timeline: "2-3 weeks"
          }
        ]
      },
      'Team': {
        rationale: "The venture shows strong team composition with relevant expertise and clear role definitions. However, there are opportunities to strengthen team development plans and organizational structure for scaling.",
        evidence: [
          "Core team assembled with complementary skills and expertise",
          "Clear role definitions and responsibilities established",
          "Team members demonstrate relevant industry experience"
        ],
        nextSteps: [
          "Develop comprehensive team scaling and hiring plan",
          "Establish performance metrics and evaluation frameworks",
          "Create knowledge sharing and succession planning processes"
        ],
        recommendations: [
          {
            action: "Develop detailed hiring plan for next 12 months",
            impact: "high impact",
            timeline: "2-3 weeks"
          },
          {
            action: "Implement performance management and evaluation systems",
            impact: "medium impact",
            timeline: "3-4 weeks"
          },
          {
            action: "Create team development and training programs",
            impact: "low impact",
            timeline: "4-6 weeks"
          }
        ]
      },
      'Sustainability': {
        rationale: "The venture demonstrates awareness of environmental and social impact considerations. However, there are opportunities to strengthen sustainability metrics, reporting frameworks, and long-term impact measurement.",
        evidence: [
          "Environmental impact considerations integrated into business model",
          "Social responsibility initiatives identified and planned",
          "Sustainability goals aligned with business objectives"
        ],
        nextSteps: [
          "Develop comprehensive sustainability metrics and KPIs",
          "Create environmental impact assessment and mitigation plan",
          "Establish sustainability reporting and monitoring systems"
        ],
        recommendations: [
          {
            action: "Develop comprehensive sustainability metrics framework",
            impact: "high impact",
            timeline: "2-3 weeks"
          },
          {
            action: "Conduct environmental impact assessment",
            impact: "medium impact",
            timeline: "3-4 weeks"
          },
          {
            action: "Implement sustainability reporting and monitoring systems",
            impact: "medium impact",
            timeline: "4-6 weeks"
          }
        ]
      },
      'System Integration': {
        rationale: "The venture shows good understanding of system integration requirements and technical dependencies. However, there are opportunities to strengthen integration architecture and third-party partnership planning.",
        evidence: [
          "System integration requirements clearly identified and documented",
          "Technical dependencies mapped with risk assessment",
          "Integration architecture planned with scalability considerations"
        ],
        nextSteps: [
          "Develop detailed integration testing and validation protocols",
          "Create third-party partnership and API management strategy",
          "Establish system monitoring and maintenance procedures"
        ],
        recommendations: [
          {
            action: "Develop comprehensive integration testing framework",
            impact: "high impact",
            timeline: "3-4 weeks"
          },
          {
            action: "Create third-party partnership and API management strategy",
            impact: "medium impact",
            timeline: "2-3 weeks"
          },
          {
            action: "Implement system monitoring and alerting infrastructure",
            impact: "medium impact",
            timeline: "2-3 weeks"
          }
        ]
      },
      'IP': {
        rationale: "The venture demonstrates good understanding of intellectual property considerations and protection strategies. However, there are opportunities to strengthen IP portfolio development and protection mechanisms.",
        evidence: [
          "Intellectual property assets identified and catalogued",
          "IP protection strategy aligned with business objectives",
          "Competitive IP landscape analyzed with differentiation opportunities"
        ],
        nextSteps: [
          "Develop comprehensive IP portfolio and protection strategy",
          "Conduct thorough freedom-to-operate analysis",
          "Create IP monetization and licensing framework"
        ],
        recommendations: [
          {
            action: "Develop comprehensive IP protection and filing strategy",
            impact: "high impact",
            timeline: "4-6 weeks"
          },
          {
            action: "Conduct freedom-to-operate analysis across key markets",
            impact: "medium impact",
            timeline: "3-4 weeks"
          },
          {
            action: "Create IP monetization and licensing framework",
            impact: "medium impact",
            timeline: "2-3 weeks"
          }
        ]
      },
      'Funding': {
        rationale: "The venture shows solid understanding of funding requirements and investor landscape. However, there are opportunities to strengthen financial planning and investor readiness materials.",
        evidence: [
          "Funding requirements clearly calculated with use of funds breakdown",
          "Investor target list developed with relevant criteria",
          "Financial projections support funding ask and growth plans"
        ],
        nextSteps: [
          "Develop comprehensive investor presentation and pitch materials",
          "Create detailed due diligence documentation package",
          "Establish investor relations and communication strategy"
        ],
        recommendations: [
          {
            action: "Develop comprehensive investor presentation and pitch deck",
            impact: "high impact",
            timeline: "2-3 weeks"
          },
          {
            action: "Create detailed due diligence documentation package",
            impact: "medium impact",
            timeline: "3-4 weeks"
          },
          {
            action: "Establish investor relations and communication strategy",
            impact: "medium impact",
            timeline: "2-3 weeks"
          }
        ]
      }
    };
    
    return previewData[dimension as keyof typeof previewData] || previewData['Business Model'];
  };

  const previewData = getDimensionPreviewData(dimension);

  return (
    <div className="space-y-6">

          {/* Preview Section - Exact format as real AI Analysis */}
          <div className="border border-gray-200 rounded-lg p-4">
            {/* Note at the top */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 text-center">
                <strong>Note:</strong> This is a preview of the detailed analysis you'll receive. Upload your business documents for personalized, AI-powered insights tailored to your specific venture.
              </p>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Preview: AI Analysis</h3>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">AI Analysis</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-600">
                      85% Confidence
                    </span>
                    <Badge variant="secondary">
                      High Confidence
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Analysis completed on {new Date().toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Assessment Rationale */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Assessment Rationale</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {previewData.rationale}
                  </p>
                </div>

                {/* Evidence Found */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Evidence Found</h4>
                  <div className="space-y-2">
                    {previewData.evidence.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Immediate Next Steps */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Immediate Next Steps</h4>
                  <div className="space-y-2">
                    {previewData.nextSteps.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                  <div className="space-y-3">
                    {previewData.recommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{rec.action}</span>
                          <Badge variant="default" className={
                            rec.impact === 'high impact' ? 'bg-green-100 text-green-800' :
                            rec.impact === 'medium impact' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }>
                            {rec.impact}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          Estimated timeline: {rec.timeline}
                        </div>
                        {rec.dependency && (
                          <div className="text-xs text-gray-500 mt-1">
                            Dependency: {rec.dependency}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* CTA Button */}
      <div className="text-center space-y-3">
        <Button 
          onClick={onStartAnalysis}
          disabled={isRunning}
          size="lg"
          className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {hasFiles ? 'Start Analysis' : 'Start Basic Analysis'}
            </>
          )}
        </Button>
        
        <p className="text-xs text-gray-500">
          Analysis typically takes 30-60 seconds
        </p>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4 text-left">
        <h4 className="text-sm font-medium text-gray-900 mb-2">About {title} Analysis</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

    </div>
  );
}

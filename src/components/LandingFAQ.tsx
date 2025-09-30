'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  example: string;
}

const landingFAQData: FAQItem[] = [
  {
    id: 'what-is-framework',
    question: 'What is the Multidimensional De-Risking Framework?',
    answer: 'It\'s a roadmap for space startups to advance across eight readiness dimensions (tech, market, business, team, IP, funding, sustainability, integration) using the KTH Innovation Readiness Levels (IRL 1–9).',
    example: 'A propulsion startup moves up a level when its lab tests are backed by an interface spec (ICD) signed with a satellite prime.'
  },
  {
    id: 'why-better-than-trl',
    question: 'Why is this better than just TRL?',
    answer: 'TRL only tracks technology. We also measure market traction, funding roadmap, team, regulation/IP, and ecosystem fit, so startups avoid being "tech-strong but commercially stranded."',
    example: 'An EO analytics venture needs LoIs and pilots (Market IRL 5) before Series A, not just working algorithms.'
  },
  {
    id: 'system-integration',
    question: 'What does System Integration Readiness mean?',
    answer: 'It tracks how well your venture plugs into the space value chain—technically and commercially.',
    example: 'Ground-segment integration tests with a customer\'s GIS system lift Integration IRL from 3→4.'
  },
  {
    id: 'founders-get',
    question: 'What do founders actually get?',
    answer: 'A radar of 8 readiness scores (IRL 1–9), a bottleneck report (weakest dimensions gating funding), and a clear roadmap with next-step tasks.',
    example: '"Hire a commercial lead to raise Team IRL 4→5."'
  },
  {
    id: 'investors-gain',
    question: 'What do investors gain?',
    answer: 'Transparent, evidence-based signals of where risks remain and which actions unlock funding milestones.',
    example: 'Tech 7, Market 3 = "stranded technology risk," flagged before term sheet.'
  }
];

export default function LandingFAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set([landingFAQData[0]?.id])); // First item open by default

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <section className="mx-auto max-w-4xl py-16 border-t">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8">Frequently Asked Questions</h2>
      
      <div className="space-y-0">
        {landingFAQData.map((item) => {
          const isOpen = openItems.has(item.id);
          
          return (
            <div key={item.id} className="border-b border-gray-200">
              <button
                className="w-full py-6 text-left flex justify-between items-start focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`landing-faq-${item.id}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">{item.question}</h3>
                <span className="flex-shrink-0 text-gray-400">
                  {isOpen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </span>
              </button>
              <div
                id={`landing-faq-${item.id}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={!isOpen}
              >
                <div className="pb-6">
                  <p className="text-gray-700 mb-3">{item.answer}</p>
                  <p className="text-sm text-gray-600 italic">
                    <strong>Example:</strong> {item.example}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link 
          href="/faq" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          Show more FAQs
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

// Dimension configuration mapping
const DIMENSION_CONFIG = {
  'technology': {
    dimension: 'Technology',
    title: 'Technology Readiness Levels',
    description: 'Track the evolution of your venture\'s technical capabilities from initial concept to proven, scalable technology.',
  },
  'customer-market': {
    dimension: 'Customer/Market',
    title: 'Customer/Market Readiness Levels', 
    description: 'Track the evolution of your venture\'s market understanding and customer validation from initial assumptions to proven product-market fit.',
  },
  'business-model': {
    dimension: 'Business Model',
    title: 'Business Model Readiness Levels',
    description: 'Track the evolution of your venture\'s business strategy from initial concept to proven, profitable operations.',
  },
  'team': {
    dimension: 'Team',
    title: 'Team Readiness Levels',
    description: 'Track the evolution of your venture\'s team composition and capabilities from initial founding team to fully-equipped organization.',
  },
  'ip': {
    dimension: 'IP',
    title: 'IP Readiness Levels',
    description: 'Track the evolution of your venture\'s intellectual property strategy from initial concepts to comprehensive IP portfolio.',
  },
  'funding': {
    dimension: 'Funding',
    title: 'Funding Readiness Levels',
    description: 'Track the evolution of your venture\'s funding strategy from initial capital needs to comprehensive financial roadmap.',
  },
  'sustainability': {
    dimension: 'Sustainability',
    title: 'Sustainability Readiness Levels',
    description: 'Track the evolution of your venture\'s environmental and social impact considerations from initial awareness to integrated sustainability strategy.',
  },
  'system-integration': {
    dimension: 'System Integration',
    title: 'System Integration Readiness Levels',
    description: 'Track the evolution of your venture\'s system integration capabilities from standalone solutions to seamlessly integrated ecosystem components.',
  }
} as const;

type DimensionSlug = keyof typeof DIMENSION_CONFIG;

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const config = DIMENSION_CONFIG[resolvedParams.slug as DimensionSlug];
  
  if (!config) {
    return {
      title: 'Dimension Not Found',
      description: 'The requested dimension could not be found.',
    };
  }

  const title = `${config.dimension} - Space Venture Readiness`;
  const description = config.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(config.dimension)}&description=${encodeURIComponent(description)}&dimension=${encodeURIComponent(config.dimension)}`,
          width: 1200,
          height: 630,
          alt: `${config.dimension} - Space Venture Readiness`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(config.dimension)}&description=${encodeURIComponent(description)}&dimension=${encodeURIComponent(config.dimension)}`],
    },
  };
}

export default function DimensionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

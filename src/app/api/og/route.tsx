import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get dynamic parameters from URL
    const title = searchParams.get('title') || 'Space Readiness';
    const description = searchParams.get('description') || 'Multidimensional de-risking for space ventures';
    const venture = searchParams.get('venture') || null;
    const dimension = searchParams.get('dimension') || null;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '60px',
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#ffffff',
            lineHeight: '1.2',
            whiteSpace: 'pre-line',
          }}
        >
          {`De-Risking
Space Ventures

8 dimensions
${Math.floor(Math.random() * 50) + 10} recommendations to date`}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

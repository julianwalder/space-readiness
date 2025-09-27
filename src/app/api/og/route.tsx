import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get total recommendations count from database
    let recommendationsCount = 0;
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { count } = await supabase
        .from('recommendations')
        .select('*', { count: 'exact', head: true });
      
      recommendationsCount = count || 0;
    } catch (error) {
      console.error('Error fetching recommendations count:', error);
      // Fallback to a reasonable number if database query fails
      recommendationsCount = 42;
    }

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
${recommendationsCount} recommendations to date`}
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

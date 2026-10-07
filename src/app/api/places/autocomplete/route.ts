import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('input') || searchParams.get('q') || '';
    const location = searchParams.get('location') || '';

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ predictions: [] });
    }

    const apiKey = process.env.OLA_MAPS_API_KEY;
    if (!apiKey) {
      console.error('[Ola Maps] OLA_MAPS_API_KEY environment variable is missing');
      return NextResponse.json(
        { error: 'Ola Maps API key not configured on server', predictions: [] },
        { status: 500 }
      );
    }

    let url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query.trim())}&api_key=${encodeURIComponent(apiKey)}`;
    if (location) {
      url += `&location=${encodeURIComponent(location)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }, // Cache frequent autocomplete queries for 60 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Ola Maps Autocomplete] HTTP ${response.status}:`, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch predictions from Ola Maps', predictions: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      status: data.status || 'OK',
      predictions: data.predictions || [],
    });
  } catch (error: any) {
    console.error('[Ola Maps Autocomplete Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error', predictions: [] },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KNOWN_INDIAN_STATES = [
  'Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Delhi', 'Gujarat', 'Rajasthan', 'West Bengal',
  'Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Bihar',
  'Odisha', 'Assam', 'Goa', 'Himachal Pradesh', 'Uttarakhand',
  'Jammu and Kashmir', 'Chandigarh', 'Puducherry'
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id') || searchParams.get('id');

    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing required place_id parameter' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OLA_MAPS_API_KEY;
    if (!apiKey) {
      console.error('[Ola Maps] OLA_MAPS_API_KEY environment variable is missing');
      return NextResponse.json(
        { error: 'Ola Maps API key not configured on server' },
        { status: 500 }
      );
    }

    const url = `https://api.olamaps.io/places/v1/details?place_id=${encodeURIComponent(placeId)}&api_key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Ola Maps Details] HTTP ${response.status}:`, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch place details from Ola Maps' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.result || {};
    const addressComponents = result.address_components || [];

    let pincode = '';
    let state = '';
    let city = '';
    let sublocality = '';
    let district = '';

    for (const comp of addressComponents) {
      const types: string[] = comp.types || [];
      const name = comp.long_name || comp.short_name || '';

      if (types.includes('postal_code') && !pincode) {
        pincode = name;
      } else if (types.includes('administrative_area_level_1') && !state) {
        state = name;
      } else if (types.includes('administrative_area_level_2') && !district) {
        district = name;
      } else if (types.includes('locality') && !city) {
        city = name;
      } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        if (!sublocality) sublocality = name;
      } else if (types.includes('postal_town') && !city) {
        city = name;
      }
    }

    const formattedAddress = result.formatted_address || '';

    // Fallback 1: Extract 6-digit PIN code from formatted address if not in components
    if (!pincode && formattedAddress) {
      const pinMatch = formattedAddress.match(/\b([1-9][0-9]{5})\b/);
      if (pinMatch) pincode = pinMatch[1];
    }

    // Fallback 2: State detection from formatted address
    if (!state && formattedAddress) {
      const matched = KNOWN_INDIAN_STATES.find(s =>
        formattedAddress.toLowerCase().includes(s.toLowerCase())
      );
      if (matched) state = matched;
    }

    // Default fallbacks for city if only district or sublocality is available
    if (!city) {
      city = district || sublocality || 'Bengaluru';
    }

    const parsedData = {
      placeId: result.place_id || placeId,
      name: result.name || '',
      addressLine1: result.name || formattedAddress.split(',')[0]?.trim() || '',
      addressLine2: sublocality || undefined,
      city: city || 'Bengaluru',
      state: state || 'Karnataka',
      pincode,
      formattedAddress,
      location: result.geometry?.location || null,
      types: result.types || [],
    };

    return NextResponse.json({
      status: 'OK',
      result: parsedData,
    });
  } catch (error: any) {
    console.error('[Ola Maps Details Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

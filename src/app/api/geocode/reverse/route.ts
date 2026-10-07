import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const KNOWN_INDIAN_STATES = [
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Assam',
  'Goa',
  'Himachal Pradesh',
  'Uttarakhand',
  'Other State / Union Territory',
];

function normalizeIndianState(rawState: string | undefined): string {
  if (!rawState) return 'Karnataka';
  const clean = rawState.trim().toLowerCase();

  if (clean.includes('karnataka')) return 'Karnataka';
  if (clean.includes('tamil nadu')) return 'Tamil Nadu';
  if (clean.includes('kerala')) return 'Kerala';
  if (clean.includes('telangana')) return 'Telangana';
  if (clean.includes('andhra')) return 'Andhra Pradesh';
  if (clean.includes('maharashtra')) return 'Maharashtra';
  if (clean.includes('delhi')) return 'Delhi';
  if (clean.includes('gujarat')) return 'Gujarat';
  if (clean.includes('rajasthan')) return 'Rajasthan';
  if (clean.includes('bengal')) return 'West Bengal';
  if (clean.includes('uttar pradesh')) return 'Uttar Pradesh';
  if (clean.includes('madhya pradesh')) return 'Madhya Pradesh';
  if (clean.includes('punjab')) return 'Punjab';
  if (clean.includes('haryana')) return 'Haryana';
  if (clean.includes('bihar')) return 'Bihar';
  if (clean.includes('odisha') || clean.includes('orissa')) return 'Odisha';
  if (clean.includes('assam')) return 'Assam';
  if (clean.includes('goa')) return 'Goa';
  if (clean.includes('himachal')) return 'Himachal Pradesh';
  if (clean.includes('uttarakhand')) return 'Uttarakhand';

  const exact = KNOWN_INDIAN_STATES.find(
    (s) => s.toLowerCase() === clean
  );
  return exact || 'Other State / Union Territory';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Latitude and Longitude parameters are required.' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: 'Invalid numeric coordinates provided.' },
        { status: 400 }
      );
    }

    let pincode = '';
    let city = '';
    let rawState = '';
    let locality = '';
    let road = '';

    // Primary Reverse Geocoder: OpenStreetMap / Nominatim
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const res = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'GoodFills-Ecommerce/1.0 (contact@goodfills.in)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        pincode = (addr.postcode || '').replace(/\D/g, '').slice(0, 6);
        city = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Bengaluru';
        rawState = addr.state || '';
        locality = addr.suburb || addr.neighbourhood || addr.residential || addr.commercial || '';
        road = addr.road || addr.pedestrian || '';
      }
    } catch (nomErr) {
      console.warn('Nominatim reverse geocode error or timeout:', nomErr);
    }

    // Fallback Geocoder: BigDataCloud Client API
    if (!pincode || !city) {
      try {
        const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const res2 = await fetch(bdcUrl, { signal: AbortSignal.timeout(4000) });
        if (res2.ok) {
          const data2 = await res2.json();
          if (!pincode && data2.postcode) {
            pincode = (data2.postcode || '').replace(/\D/g, '').slice(0, 6);
          }
          if (!city && (data2.city || data2.locality)) {
            city = data2.city || data2.locality;
          }
          if (!rawState && data2.principalSubdivision) {
            rawState = data2.principalSubdivision;
          }
          if (!locality && data2.locality) {
            locality = data2.locality;
          }
        }
      } catch (bdcErr) {
        console.warn('BigDataCloud reverse geocode fallback error:', bdcErr);
      }
    }

    // Cross-verify detected PIN code with official India Post Directory for pinpoint district & state
    if (pincode && pincode.length === 6) {
      try {
        const postRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
          signal: AbortSignal.timeout(2500),
        });
        if (postRes.ok) {
          const postData = await postRes.json();
          const firstPo = postData?.[0]?.PostOffice?.[0];
          if (firstPo) {
            if (firstPo.State) rawState = firstPo.State;
            if (firstPo.District) {
              const d = firstPo.District.trim();
              if (/^bangalore/i.test(d)) city = 'Bengaluru';
              else if (/^bombay/i.test(d)) city = 'Mumbai';
              else if (/^madras/i.test(d)) city = 'Chennai';
              else if (/^calcutta/i.test(d)) city = 'Kolkata';
              else city = d;
            }
            if (!locality && firstPo.Name) {
              locality = firstPo.Name.replace(/\s*\([^)]*\)/g, '').trim();
            }
          }
        }
      } catch (postErr) {
        // Keep fallback data if India Post is slow
      }
    }

    const state = normalizeIndianState(rawState);
    city = city || 'Bengaluru';

    // Construct a friendly, human-readable summary
    const summaryParts = [locality, city, state, pincode].filter(Boolean);
    const formattedSummary = summaryParts.join(', ');

    return NextResponse.json(
      {
        success: true,
        location: {
          pincode,
          city,
          state,
          locality,
          road,
          formattedSummary,
          latitude,
          longitude,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error('Reverse geocode unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Reverse geocoding failed.' },
      { status: 500 }
    );
  }
}

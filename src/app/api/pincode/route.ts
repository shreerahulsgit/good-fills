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
  'Jammu and Kashmir',
  'Chandigarh',
  'Puducherry',
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
  if (clean.includes('jammu') || clean.includes('kashmir')) return 'Jammu and Kashmir';
  if (clean.includes('chandigarh')) return 'Chandigarh';
  if (clean.includes('puducherry') || clean.includes('pondicherry')) return 'Puducherry';

  const exact = KNOWN_INDIAN_STATES.find((s) => s.toLowerCase() === clean);
  return exact || 'Other State / Union Territory';
}

function normalizeCity(rawDistrict: string | undefined, locality: string | undefined): string {
  const d = (rawDistrict || '').trim();
  if (!d) return locality || 'Bengaluru';

  // Common city aliases
  if (/^bangalore/i.test(d) || /^bengaluru/i.test(d)) return 'Bengaluru';
  if (/^bombay/i.test(d) || /^mumbai/i.test(d)) return 'Mumbai';
  if (/^madras/i.test(d) || /^chennai/i.test(d)) return 'Chennai';
  if (/^calcutta/i.test(d) || /^kolkata/i.test(d)) return 'Kolkata';
  if (/^cochin/i.test(d) || /^kochi/i.test(d)) return 'Kochi';
  if (/^trivandrum/i.test(d) || /^thiruvananthapuram/i.test(d)) return 'Thiruvananthapuram';
  if (/^mysore/i.test(d) || /^mysuru/i.test(d)) return 'Mysuru';
  if (/^mangalore/i.test(d) || /^mangaluru/i.test(d)) return 'Mangaluru';
  if (/^gurgaon/i.test(d) || /^gurugram/i.test(d)) return 'Gurugram';
  if (/^central delhi|north delhi|south delhi|east delhi|west delhi|new delhi/i.test(d)) return 'Delhi';

  return d;
}

// In-memory LRU-like cache to avoid redundant network round-trips
const pinCache = new Map<string, any>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get('pin') || searchParams.get('pincode') || '';
    const cleanPin = pin.replace(/\D/g, '').slice(0, 6);

    if (cleanPin.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'A valid 6-digit PIN code is required.' },
        { status: 400 }
      );
    }

    // Check memory cache
    if (pinCache.has(cleanPin)) {
      return NextResponse.json(pinCache.get(cleanPin), {
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }

    // Call India Post Official Directory API
    const postUrl = `https://api.postalpincode.in/pincode/${cleanPin}`;
    const res = await fetch(postUrl, {
      signal: AbortSignal.timeout(4500),
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: 'Postal directory service temporarily unavailable.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const result = Array.isArray(data) ? data[0] : null;

    if (!result || result.Status !== 'Success' || !Array.isArray(result.PostOffice) || result.PostOffice.length === 0) {
      return NextResponse.json(
        { success: false, error: result?.Message || 'PIN code not found in postal directory.' },
        { status: 404 }
      );
    }

    const offices = result.PostOffice;
    const firstPo = offices[0];

    const state = normalizeIndianState(firstPo.State);
    const primaryLocality = (firstPo.Name || '').replace(/\s*\([^)]*\)/g, '').trim();
    const city = normalizeCity(firstPo.District, primaryLocality);
    const district = firstPo.District || city;

    // Collect distinct localities for dropdown or recommendation
    const localities = Array.from(
      new Set(
        offices
          .map((po: any) => (po.Name || '').replace(/\s*\([^)]*\)/g, '').trim())
          .filter(Boolean)
      )
    ).slice(0, 8);

    const payload = {
      success: true,
      pincode: cleanPin,
      city,
      district,
      state,
      localities,
      primaryLocality,
      formatted: `${primaryLocality ? `${primaryLocality}, ` : ''}${city}, ${state} – ${cleanPin}`,
    };

    // Store in cache
    if (pinCache.size > 2000) {
      pinCache.clear();
    }
    pinCache.set(cleanPin, payload);

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: any) {
    console.error('PIN code lookup error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to resolve postal details.' },
      { status: 500 }
    );
  }
}

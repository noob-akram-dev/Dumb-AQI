'use server';

import { generateAqiImpactExamples } from '@/ai/flows/generate-aqi-impact-examples';
import type { AqiData } from '@/lib/types';

// The API key is set to 'demo' as a placeholder.
// For a production app, you should get a real key from https://aqicn.org/api/
const WAQI_API_TOKEN = process.env.WAQI_API_TOKEN || 'demo';

type LocationInput = {
  lat?: number;
  lon?: number;
  city?: string;
};

export async function getAqiData(
  location: LocationInput
): Promise<AqiData | { error: string }> {
  let url = '';
  if (location.lat !== undefined && location.lon !== undefined) {
    url = `https://api.waqi.info/feed/geo:${location.lat};${location.lon}/?token=${WAQI_API_TOKEN}`;
  } else if (location.city) {
    url = `https://api.waqi.info/feed/${encodeURIComponent(
      location.city
    )}/?token=${WAQI_API_TOKEN}`;
  } else {
    return { error: 'No location provided.' };
  }

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      throw new Error(`Failed to fetch AQI data. Status: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== 'ok') {
      return {
        error: data.data || 'Could not find AQI data for this location.',
      };
    }

    const aqi = data.data.aqi;
    const city = data.data.city.name;

    if (typeof aqi !== 'number') {
      return { error: 'AQI data is not available for this station.' };
    }

    const impactResult = await generateAqiImpactExamples({
      aqi,
      location: city,
    });

    return {
      aqi,
      city,
      examples: impactResult.examples,
    };
  } catch (error) {
    console.error(error);
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}

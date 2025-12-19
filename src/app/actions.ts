'use server';

import { generateAqiImpactExamples } from '@/ai/flows/generate-aqi-impact-examples';
import type { AqiData } from '@/lib/types';
import { XMLParser } from 'fast-xml-parser';

type LocationInput = {
  lat?: number;
  lon?: number;
  city?: string;
};

// Haversine formula to calculate distance between two lat/lon points
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export async function getAqiData(
  location: LocationInput
): Promise<AqiData | { error: string }> {
  const url = 'https://airquality.cpcb.gov.in/caaqms/rss_feed';

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      throw new Error(`Failed to fetch AQI data. Status: ${response.status}`);
    }
    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    const jsonData = parser.parse(xmlData);

    const allStations: any[] = [];
    const states = Array.isArray(jsonData.AqIndex.Country.State)
      ? jsonData.AqIndex.Country.State
      : [jsonData.AqIndex.Country.State];

    for (const state of states) {
      const cities = Array.isArray(state.City) ? state.City : [state.City];
      for (const city of cities) {
        const stations = Array.isArray(city.Station)
          ? city.Station
          : [city.Station];
        for (const station of stations) {
          allStations.push({
            ...station,
            city: city.id,
            state: state.id,
          });
        }
      }
    }

    if (allStations.length === 0) {
      return { error: 'No AQI stations found in the data source.' };
    }

    let targetStation: any;

    if (location.lat !== undefined && location.lon !== undefined) {
      let closestStation: any = null;
      let minDistance = Infinity;

      for (const station of allStations) {
        const lat = parseFloat(station.latitude);
        const lon = parseFloat(station.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          const distance = getDistance(location.lat, location.lon, lat, lon);
          if (distance < minDistance) {
            minDistance = distance;
            closestStation = station;
          }
        }
      }
      targetStation = closestStation;
    } else if (location.city) {
      const searchCity = location.city.toLowerCase().replace(/_/g, ' ');
      targetStation = allStations.find(
        (s) => s.city.toLowerCase().replace(/_/g, ' ') === searchCity
      );
    }

    if (!targetStation) {
      return {
        error: `Could not find AQI data for "${
          location.city || 'your location'
        }".`,
      };
    }

    const aqi = parseInt(targetStation.Air_Quality_Index?.Value, 10);
    const city = targetStation.city.replace(/_/g, ' ');

    if (isNaN(aqi)) {
      return { error: 'AQI data is not available for this station.' };
    }

    const impactResult = await generateAqiImpactExamples({
      aqi,
      location: city,
    });

    return {
      aqi,
      city: `${targetStation.id}, ${city}`,
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

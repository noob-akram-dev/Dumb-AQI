'use server';

import { generateAqiImpactExamples } from '@/ai/flows/generate-aqi-impact-examples';
import type { AqiData } from '@/lib/types';
import { XMLParser } from 'fast-xml-parser';

type LocationInput = {
  lat?: number;
  lon?: number;
  city?: string;
  state?: string;
  station?: string;
};

const API_URL = 'https://airquality.cpcb.gov.in/caaqms/rss_feed';

let cachedData: any = null;
let lastFetchTime = 0;

async function fetchAndParseAqiData() {
  const now = Date.now();
  // Cache for 1 hour
  if (cachedData && now - lastFetchTime < 3600 * 1000) {
    return cachedData;
  }

  const response = await fetch(API_URL, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`Failed to fetch AQI data. Status: ${response.status}`);
  }
  const xmlData = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });
  const jsonData = parser.parse(xmlData);

  cachedData = jsonData;
  lastFetchTime = now;

  return jsonData;
}

function getAllStations() {
  const jsonData = cachedData;
  const allStations: any[] = [];
  if (!jsonData?.AqIndex?.Country?.State) {
    return [];
  }
  const states = Array.isArray(jsonData.AqIndex.Country.State)
    ? jsonData.AqIndex.Country.State
    : [jsonData.AqIndex.Country.State];

  for (const state of states) {
    if (!state.City) continue;
    const cities = Array.isArray(state.City) ? state.City : [state.City];
    for (const city of cities) {
      if (!city.Station) continue;
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
  return allStations;
}

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

export async function getStates(): Promise<{ id: string; name: string }[]> {
  try {
    const jsonData = await fetchAndParseAqiData();
    if (!jsonData?.AqIndex?.Country?.State) return [];
    const states = Array.isArray(jsonData.AqIndex.Country.State)
      ? jsonData.AqIndex.Country.State
      : [jsonData.AqIndex.Country.State];

    return states
      .map((s: any) => ({
        id: s.id,
        name: s.id.replace(/_/g, ' '),
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
}

export async function getCities(
  stateId: string
): Promise<{ id: string; name: string }[]> {
  try {
    const jsonData = await fetchAndParseAqiData();
    if (!jsonData?.AqIndex?.Country?.State) return [];
    const states = Array.isArray(jsonData.AqIndex.Country.State)
      ? jsonData.AqIndex.Country.State
      : [jsonData.AqIndex.Country.State];

    const state = states.find((s: any) => s.id === stateId);
    if (!state || !state.City) return [];

    const cities = Array.isArray(state.City) ? state.City : [state.City];
    return cities
      .map((c: any) => ({
        id: c.id,
        name: c.id.replace(/_/g, ' '),
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

export async function getStations(
  stateId: string,
  cityId: string
): Promise<{ id: string; name: string }[]> {
  try {
    const jsonData = await fetchAndParseAqiData();
    if (!jsonData?.AqIndex?.Country?.State) return [];

    const states = Array.isArray(jsonData.AqIndex.Country.State)
      ? jsonData.AqIndex.Country.State
      : [jsonData.AqIndex.Country.State];

    const state = states.find((s: any) => s.id === stateId);
    if (!state || !state.City) return [];

    const cities = Array.isArray(state.City) ? state.City : [state.City];
    const city = cities.find((c: any) => c.id === cityId);
    if (!city || !city.Station) return [];

    const stations = Array.isArray(city.Station)
      ? city.Station
      : [city.Station];

    return stations
      .map((s: any) => ({
        id: s.id,
        name: s.id,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
}

function findStation(
  stateId: string,
  cityId: string,
  stationId: string
): any {
  const jsonData = cachedData;
  const states = Array.isArray(jsonData.AqIndex.Country.State)
    ? jsonData.AqIndex.Country.State
    : [jsonData.AqIndex.Country.State];

  const state = states.find((s: any) => s.id === stateId);
  if (!state || !state.City) return null;

  const cities = Array.isArray(state.City) ? state.City : [state.City];
  const city = cities.find((c: any) => c.id === cityId);
  if (!city || !city.Station) return null;

  const stations = Array.isArray(city.Station)
    ? city.Station
    : [city.Station];
  const station = stations.find((s: any) => s.id === stationId);

  if (station) {
    return {
      ...station,
      city: city.id,
      state: state.id,
    };
  }
  return null;
}

export async function getAqiData(
  location: LocationInput
): Promise<AqiData | { error: string }> {
  try {
    await fetchAndParseAqiData(); // Ensure data is fetched and cached

    let targetStation: any;
    const allStations = getAllStations();

    if (allStations.length === 0) {
      return { error: 'No AQI stations found in the data source.' };
    }

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
    } else if (location.station && location.city && location.state) {
      targetStation = findStation(
        location.state,
        location.city,
        location.station
      );
    } else if (location.city) {
      // Fallback for direct city search if new flow is not used
      const searchCity = location.city.toLowerCase().replace(/_/g, ' ');
      targetStation = allStations.find(
        (s) => s.city.toLowerCase().replace(/_/g, ' ') === searchCity
      );
    }

    if (!targetStation) {
      return {
        error: `Could not find AQI data for the specified location.`,
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

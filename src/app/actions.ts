"use server";

import { generateAqiImpactExamples } from "@/ai/flows/generate-aqi-impact-examples";
import type { AqiData } from "@/lib/types";
import { XMLParser } from "fast-xml-parser";

type LocationInput = {
  lat?: number;
  lon?: number;
  city?: string;
  state?: string;
  station?: string;
};

const API_URL = "https://airquality.cpcb.gov.in/caaqms/rss_feed";

let cachedData: any = null;
let lastFetchTime = 0;

async function fetchAndParseAqiData() {
  const now = Date.now();
  // Cache for 1 hour
  if (cachedData && now - lastFetchTime < 3600 * 1000) {
    console.log("Using cached AQI data");
    return cachedData;
  }

  console.log("Fetching fresh AQI data from:", API_URL);

  try {
    const response = await fetch(API_URL, {
      next: { revalidate: 3600 },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`API fetch failed with status: ${response.status}`);
      throw new Error(`Failed to fetch AQI data. Status: ${response.status}`);
    }

    const xmlData = await response.text();
    console.log("XML data fetched, length:", xmlData.length);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    const jsonData = parser.parse(xmlData);
    console.log("XML parsed successfully");

    if (!jsonData?.AqIndex?.Country?.State) {
      console.error("Unexpected data structure:", jsonData);
      throw new Error("Invalid data structure from AQI API");
    }

    cachedData = jsonData;
    lastFetchTime = now;

    return jsonData;
  } catch (error) {
    console.error("Error in fetchAndParseAqiData:", error);
    throw error;
  }
}

// Reverse geocoding using free Nominatim API
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'DumbAQI/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error("Reverse geocoding failed:", response.status);
      return null;
    }

    const data = await response.json();
    const address = data.address;

    // Build a readable location name
    const parts: string[] = [];
    if (address.suburb || address.neighbourhood || address.residential) {
      parts.push(address.suburb || address.neighbourhood || address.residential);
    }
    if (address.city || address.town || address.village || address.municipality) {
      parts.push(address.city || address.town || address.village || address.municipality);
    }
    if (address.state) {
      parts.push(address.state);
    }

    return parts.length > 0 ? parts.join(", ") : null;
  } catch (error) {
    console.error("Error in reverseGeocode:", error);
    return null;
  }
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
  lon2: number,
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
        name: s.id.replace(/_/g, " "),
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
}

export async function getCities(
  stateId: string,
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
        name: c.id.replace(/_/g, " "),
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

export async function getStations(
  stateId: string,
  cityId: string,
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
    console.error("Error fetching stations:", error);
    return [];
  }
}

function findStation(stateId: string, cityId: string, stationId: string): any {
  const jsonData = cachedData;
  const states = Array.isArray(jsonData.AqIndex.Country.State)
    ? jsonData.AqIndex.Country.State
    : [jsonData.AqIndex.Country.State];

  const state = states.find((s: any) => s.id === stateId);
  if (!state || !state.City) return null;

  const cities = Array.isArray(state.City) ? state.City : [state.City];
  const city = cities.find((c: any) => c.id === cityId);
  if (!city || !city.Station) return null;

  const stations = Array.isArray(city.Station) ? city.Station : [city.Station];
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
  location: LocationInput,
): Promise<AqiData | { error: string }> {
  try {
    console.log("Fetching AQI data for location:", location);
    await fetchAndParseAqiData(); // Ensure data is fetched and cached

    let targetStation: any;
    let distanceKm: number | undefined;
    let userLocation: string | undefined;
    const allStations = getAllStations();

    console.log("Total stations available:", allStations.length);

    if (allStations.length === 0) {
      return { error: "No AQI stations found in the data source." };
    }

    if (location.lat !== undefined && location.lon !== undefined) {
      console.log(
        "Searching for closest station to:",
        location.lat,
        location.lon,
      );

      // Get user's actual location via reverse geocoding
      userLocation = await reverseGeocode(location.lat, location.lon) || undefined;
      console.log("User location from reverse geocoding:", userLocation);

      let closestStation: any = null;
      let minDistance = Infinity;
      let validStationsCount = 0;

      for (const station of allStations) {
        const lat = parseFloat(station.latitude);
        const lon = parseFloat(station.longitude);
        const aqiVal = parseInt(station.Air_Quality_Index?.Value, 10);
        if (!isNaN(lat) && !isNaN(lon) && !isNaN(aqiVal)) {
          validStationsCount++;
          const distance = getDistance(location.lat, location.lon, lat, lon);
          if (distance < minDistance) {
            minDistance = distance;
            closestStation = station;
          }
        }
      }

      console.log(`Found ${validStationsCount} valid stations with AQI data`);
      if (closestStation) {
        console.log("Closest station:", {
          id: closestStation.id,
          city: closestStation.city,
          distance: minDistance.toFixed(2) + " km",
          aqi: closestStation.Air_Quality_Index?.Value,
        });
        distanceKm = Math.round(minDistance * 10) / 10; // Round to 1 decimal
      }

      targetStation = closestStation;
    } else if (location.station && location.city && location.state) {
      targetStation = findStation(
        location.state,
        location.city,
        location.station,
      );
    } else if (location.city) {
      // Fallback for direct city search if new flow is not used
      const searchCity = location.city.toLowerCase().replace(/_/g, " ");
      targetStation = allStations.find(
        (s) => s.city.toLowerCase().replace(/_/g, " ") === searchCity,
      );
    }

    if (!targetStation) {
      console.error("No target station found for location:", location);
      return {
        error: `Could not find AQI data for the specified location. Please try selecting a location manually.`,
      };
    }

    const aqi = parseInt(targetStation.Air_Quality_Index?.Value, 10);
    const city = targetStation.city.replace(/_/g, " ");
    const stationName = targetStation.id;

    console.log("Target station AQI:", aqi, "City:", city);

    if (isNaN(aqi)) {
      console.error("Invalid AQI value for station:", targetStation.id);
      return { error: "AQI data is not available for this station." };
    }

    console.log("Generating AI examples for AQI:", aqi, "Location:", city);
    const impactResult = await generateAqiImpactExamples({
      aqi,
      location: userLocation || city,
    });

    console.log("AI examples generated:", impactResult.examples);

    return {
      aqi,
      city: city,
      userLocation,
      stationName,
      distanceKm,
      examples: impactResult.examples,
      lastUpdated: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
    };
  } catch (error) {
    console.error("Error in getAqiData:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}

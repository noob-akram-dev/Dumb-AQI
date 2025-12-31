export type AqiData = {
  aqi: number;
  city: string;
  userLocation?: string;
  stationName: string;
  distanceKm?: number;
  examples: string[];
  lastUpdated?: string;
};

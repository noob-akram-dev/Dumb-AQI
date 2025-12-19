export type AqiInfo = {
  level: string;
  color: string;
  textColor: string;
};

export function getAqiInfo(aqi: number): AqiInfo {
  if (aqi <= 50) {
    return { level: 'Good', color: '#00E400', textColor: '#000000' };
  }
  if (aqi <= 100) {
    return { level: 'Moderate', color: '#FFFF00', textColor: '#000000' };
  }
  if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      color: '#FF7E00',
      textColor: '#FFFFFF',
    };
  }
  if (aqi <= 200) {
    return { level: 'Unhealthy', color: '#FF0000', textColor: '#FFFFFF' };
  }
  if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      color: '#8F3F97',
      textColor: '#FFFFFF',
    };
  }
  return { level: 'Hazardous', color: '#7E0023', textColor: '#FFFFFF' };
}

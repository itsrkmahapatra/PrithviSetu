import { getCachedData, cacheData } from '../cache';
import { fetchWithTimeout } from '../../utils/api';

export const fetchWeather = async (lat, lon) => {
  const cacheKey = `weather-${lat.toFixed(2)}-${lon.toFixed(2)}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m`);
    cacheData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Weather fetch failed', error);
    return null;
  }
};

import { useEffect, useState } from 'react';
import { fetchWeather } from '../services/api/weather';
import { purgeComponentState } from '../utils/purge';

const WeatherTab = ({ loc }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    if (!loc) return;
    
    setLoading(true);
    const loadWeather = async () => {
      const data = await fetchWeather(loc.lat, loc.lon);
      if (isMounted) {
        setWeather(data);
        setLoading(false);
      }
    };

    loadWeather();
    
    return () => {
      isMounted = false;
      purgeComponentState(setWeather, setLoading);
    };
  }, [loc]);

  if (loading) return <div className="text-sm text-gray-500 italic mt-2 animate-pulse">Fetching weather...</div>;
  if (!weather) return <div className="text-sm text-red-500 italic mt-2">Weather unavailable.</div>;

  return (
    <div className="bg-blue-50 rounded-lg p-3 mt-3 border border-blue-100 flex justify-between items-center">
      <div>
        <div className="text-xs text-blue-800 uppercase font-semibold tracking-wider">Current Weather</div>
        <div className="text-2xl font-bold text-blue-900">{weather.current.temperature_2m}°C</div>
      </div>
      <div className="text-right">
        <div className="text-sm text-blue-700">Wind: {weather.current.wind_speed_10m} km/h</div>
        <div className="text-sm text-blue-700">Rain: {weather.current.rain} mm</div>
      </div>
    </div>
  );
};

export default WeatherTab;

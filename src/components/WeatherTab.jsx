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

  if (loading) return <div className="mt-3 p-4 bg-white/50 backdrop-blur rounded-2xl animate-pulse h-20 border border-gray-100"></div>;
  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 mt-3 shadow-lg shadow-blue-200/50 flex justify-between items-center text-white transition-all hover:scale-[1.01]">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-0.5">Atmosphere</span>
        <div className="flex items-end gap-1">
            <span className="text-3xl font-black">{Math.round(weather.current.temperature_2m)}°</span>
            <span className="text-sm font-medium mb-1 opacity-90">Celsius</span>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <svg className="w-5 h-5 opacity-80 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.99 7.99 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
            <span className="text-[10px] font-bold">{weather.current.wind_speed_10m} <span className="font-normal opacity-70">km/h</span></span>
        </div>
        <div className="flex flex-col items-center border-l border-white/20 pl-4">
            <svg className="w-5 h-5 opacity-80 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.387a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547l-.35.35a2 2 0 000 2.828l1.256 1.256a2 2 0 002.828 0l.125-.125a2 2 0 012.828 0l1.256 1.256a2 2 0 002.828 0l.125-.125a2 2 0 012.828 0l1.256 1.256a2 2 0 002.828 0l.35-.35a2 2 0 000-2.828l-1.256-1.256z"></path></svg>
            <span className="text-[10px] font-bold">{weather.current.rain} <span className="font-normal opacity-70">mm</span></span>
        </div>
      </div>
    </div>
  );
};

export default WeatherTab;

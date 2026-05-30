export const cacheData = (key, data) => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

export const getCachedData = (key, ttl = 24 * 60 * 60 * 1000) => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > ttl) {
    localStorage.removeItem(key);
    return null;
  }
  return data;
};

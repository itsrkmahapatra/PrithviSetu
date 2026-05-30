import axios from 'axios';

export const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 4000);
  
  try {
    const response = await axios.get(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response.data;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

import api from './api';

/**
 * 날씨 API
 */

/** 위경도로 날씨 조회 */
export const getWeather = async (lat: number, lon: number) => {
  const response = await api.get('/weather', {
    params: { lat, lon }
  });
  return response.data;
};
/**
 * weatherApi.ts - 날씨 API
 * 기상청 초단기실황/초단기예보 API 호출
 * 
 * 수정: 5분 캐시 + 중복 호출 방지
 */

import api from './api';

interface WeatherResponse {
  status: string;
  weather?: {
    temperature: string;
    sky: string;
  };
  message?: string;
}

/** 캐시 데이터 */
interface CacheData {
  lat: number;
  lng: number;
  data: WeatherResponse;
  timestamp: number;
}

/** 캐시 유효 시간: 5분 (밀리초) */
const CACHE_DURATION = 5 * 60 * 1000;

/** 위치 동일 판정 거리 (km) */
const SAME_LOCATION_THRESHOLD = 1;

/** 캐시 저장소 */
let weatherCache: CacheData | null = null;

/** 현재 요청 중인지 (중복 호출 방지) */
let isRequesting = false;

/**
 * 두 지점 간 거리 계산 (km)
 */
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 캐시 유효성 검사
 */
const isCacheValid = (lat: number, lng: number): boolean => {
  if (!weatherCache) return false;
  
  const now = Date.now();
  const isTimeValid = (now - weatherCache.timestamp) < CACHE_DURATION;
  
  if (!isTimeValid) return false;
  
  const distance = calculateDistance(lat, lng, weatherCache.lat, weatherCache.lng);
  const isLocationSame = distance < SAME_LOCATION_THRESHOLD;
  
  return isLocationSame;
};

/**
 * 날씨 조회 (캐시 적용 + 중복 호출 방지)
 * @param lat 위도
 * @param lng 경도
 */
export const getWeather = async (lat: number, lng: number): Promise<WeatherResponse> => {
  // 캐시 확인
  if (isCacheValid(lat, lng) && weatherCache) {
    console.log('날씨 캐시 사용 (5분 내 동일 위치)');
    return weatherCache.data;
  }
  
  // 중복 호출 방지
  if (isRequesting) {
    console.log('날씨 API 요청 중... 대기');
    return {
      status: 'pending',
      message: '요청 중입니다.'
    };
  }
  
  isRequesting = true;
  
  try {
    console.log('날씨 API 호출:', lat, lng);
    const response = await api.get('/weather', {
      params: { lat, lon: lng }
    });
    
    const data = response.data as WeatherResponse;
    
    // 성공 시 캐시 저장
    if (data.status === 'success') {
      weatherCache = {
        lat,
        lng,
        data,
        timestamp: Date.now()
      };
    }
    
    return data;
  } catch (error) {
    console.error('날씨 API 에러:', error);
    return {
      status: 'fail',
      message: '날씨 정보를 가져올 수 없습니다.'
    };
  } finally {
    isRequesting = false;
  }
};

/**
 * 캐시 초기화
 */
export const clearWeatherCache = () => {
  weatherCache = null;
};
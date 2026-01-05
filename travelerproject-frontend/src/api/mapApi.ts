/**
 * mapApi.ts
 * 지도 관련 API 호출 함수 모음
 * 
 * 사용 가능한 API:
 * 1. getNearbyDestinations - 좌표 기반 주변 여행지 조회
 * 2. getDestinationsByRegion - 특정 지역 여행지 조회
 * 3. searchDestinationsForMap - 지도용 여행지 검색
 */

import api from './api';

/** 주변 여행지 응답 타입 */
export interface NearbyDestination {
  contentid: string;           // 콘텐츠 ID
  contenttypeid: string;       // 관광 타입 ID
  title: string;               // 여행지명
  addr1: string;               // 주소
  addr2: string | null;        // 상세주소
  tel: string | null;          // 전화번호
  firstimage: string | null;   // 대표 이미지 (원본)
  firstimage2: string | null;  // 대표 이미지 (썸네일)
  mapx: number;                // 경도 (longitude)
  mapy: number;                // 위도 (latitude)
  distance: number | null;     // 거리 (km)
  typeName: string;            // 관광 타입명
  regnName: string | null;     // 시도명
  signguName: string | null;   // 시군구명
}

/** API 응답 타입 */
export interface MapApiResponse {
  status: string;
  data: NearbyDestination[];
  totalCount: number;
  searchInfo?: {
    centerLat: number;
    centerLng: number;
    radius: number;
    contenttypeid: string | null;
  };
  keyword?: string;
  message?: string;
}

/**
 * 주변 여행지 조회
 * 사용자의 현재 위치를 기준으로 반경 내 여행지를 조회한다.
 * 
 * @param lat 중심 위도
 * @param lng 중심 경도
 * @param radius 검색 반경 (km), 기본값: 5km
 * @param contenttypeid 관광 타입 ID (선택)
 * @param limit 최대 조회 개수 (선택)
 * @returns 주변 여행지 목록
 * 
 * 사용 예시:
 * const result = await getNearbyDestinations(37.5665, 126.9780, 5);
 * const restaurants = await getNearbyDestinations(37.5665, 126.9780, 3, '39');
 */
export const getNearbyDestinations = async (
  lat: number,
  lng: number,
  radius: number = 5,
  contenttypeid?: string,
  limit?: number
): Promise<MapApiResponse> => {
  try {
    const params: Record<string, string | number> = {
      lat,
      lng,
      radius,
    };
    
    // 선택적 파라미터 추가
    if (contenttypeid) {
      params.contenttypeid = contenttypeid;
    }
    if (limit) {
      params.limit = limit;
    }
    
    const response = await api.get('/map/nearby', { params });
    return response.data;
  } catch (error) {
    console.error('주변 여행지 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 지역 여행지 조회
 * 플래너에서 지역 선택 시 해당 지역의 여행지를 조회한다.
 * 
 * @param lDongRegnCd 법정동 시도 코드 (필수)
 * @param lDongSignguCd 법정동 시군구 코드 (선택)
 * @param contenttypeid 관광 타입 ID (선택)
 * @param limit 최대 조회 개수 (선택)
 * @returns 해당 지역 여행지 목록
 * 
 * 사용 예시:
 * const gyeonggi = await getDestinationsByRegion('41');
 * const seongnam = await getDestinationsByRegion('41', '13');
 * const seoulFestivals = await getDestinationsByRegion('11', undefined, '15');
 */
export const getDestinationsByRegion = async (
  lDongRegnCd: string,
  lDongSignguCd?: string,
  contenttypeid?: string,
  limit?: number
): Promise<MapApiResponse> => {
  try {
    const params: Record<string, string | number> = {
      lDongRegnCd,
    };
    
    if (lDongSignguCd) {
      params.lDongSignguCd = lDongSignguCd;
    }
    if (contenttypeid) {
      params.contenttypeid = contenttypeid;
    }
    if (limit) {
      params.limit = limit;
    }
    
    const response = await api.get('/map/region', { params });
    return response.data;
  } catch (error) {
    console.error('지역 여행지 조회 실패:', error);
    throw error;
  }
};

/**
 * 지도용 여행지 검색
 * 키워드로 여행지를 검색하여 지도에 표시한다.
 * 
 * @param keyword 검색 키워드 (2글자 이상)
 * @param contenttypeid 관광 타입 ID (선택)
 * @param limit 최대 조회 개수 (선택)
 * @returns 검색된 여행지 목록
 * 
 * 사용 예시:
 * const results = await searchDestinationsForMap('경복궁');
 * const cafes = await searchDestinationsForMap('카페', '39');
 */
export const searchDestinationsForMap = async (
  keyword: string,
  contenttypeid?: string,
  limit?: number
): Promise<MapApiResponse> => {
  try {
    const params: Record<string, string | number> = {
      keyword,
    };
    
    if (contenttypeid) {
      params.contenttypeid = contenttypeid;
    }
    if (limit) {
      params.limit = limit;
    }
    
    const response = await api.get('/map/search', { params });
    return response.data;
  } catch (error) {
    console.error('여행지 검색 실패:', error);
    throw error;
  }
};

/**
 * 관광 타입 코드 상수
 */
export const CONTENT_TYPE = {
  TOURIST_SPOT: '12',     // 관광지
  CULTURAL: '14',         // 문화시설
  FESTIVAL: '15',         // 축제/공연/행사
  TRAVEL_COURSE: '25',    // 여행코스
  LEISURE: '28',          // 레포츠
  ACCOMMODATION: '32',    // 숙박
  SHOPPING: '38',         // 쇼핑
  RESTAURANT: '39',       // 음식점
} as const;

/**
 * 관광 타입 이름 매핑
 */
export const CONTENT_TYPE_NAME: Record<string, string> = {
  '12': '관광',
  '14': '문화',
  '15': '축제/공연',
  '25': '여행코스',
  '28': '레저',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식',
};

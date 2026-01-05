import api from './api';

/**
 * destinationApi.ts - 여행지 관련 API 함수
 * 여행지 목록/상세 조회, 조회수 증가, 리뷰, 찜 기능
 */

// ============================================
// 타입 정의
// ============================================

/** 시도 정보 */
export interface Region {
  lDongRegnCd: string;
  regnName: string;
}

/** 시군구 정보 */
export interface Signgu {
  lDongRegnCd: string;
  lDongSignguCd: string;
  signguName: string;
}

/** 콘텐츠 타입 (관광타입) */
export const CONTENT_TYPES: { [key: string]: string } = {
  '12': '관광지',
  '14': '문화시설',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점',
};

// ============================================
// 지역 코드 API
// ============================================

/** 시도 목록 조회 */
export const getRegions = async (): Promise<Region[]> => {
  const response = await api.get('/destination/regions');
  return response.data.data;
};

/** 시군구 목록 조회 */
export const getSignguList = async (lDongRegnCd: string): Promise<Signgu[]> => {
  const response = await api.get(`/destination/regions/${lDongRegnCd}/signgu`);
  return response.data.data;
};

// ============================================
// 여행지 기본 API
// ============================================

/** * 여행지 목록 조회 (관광타입별) 
 * contenttypeid가 없거나 빈 문자열이면 전체 목록 조회 (/destination/list)
 * 값이 있으면 해당 타입 조회 (/destination/list/{id})
 */
export const getDestinationList = async (
  contenttypeid?: string, // 👈 물음표(?)를 붙여서 선택적 파라미터로 변경
  page: number = 1, 
  size: number = 10,
  sort: string = 'latest',
  lDongRegnCd?: string,
  lDongSignguCd?: string
) => {
  const params: any = { page, size, sort};
  if (lDongRegnCd) params.lDongRegnCd = lDongRegnCd;
  if (lDongSignguCd) params.lDongSignguCd = lDongSignguCd;
  
  // ✅ 수정된 부분: contenttypeid 유무에 따라 URL 분기 처리
  // 값이 있으면: /destination/list/12
  // 값이 없으면: /destination/list
  const url = contenttypeid ? `/destination/list/${contenttypeid}` : '/destination/list';

  const response = await api.get(url, { params });
  return response.data;
};

/** 여행지 상세 조회 */
export const getDestinationDetail = async (contentid: string) => {
  const response = await api.get(`/destination/detail/${contentid}`);
  return response.data.data;
};

/** 여행지 검색 */
export const searchDestinations = async (
  keyword: string, 
  page: number = 1, 
  size: number = 10,
  lDongRegnCd?: string,
  lDongSignguCd?: string
) => {
  const params: any = { keyword, page, size };
  if (lDongRegnCd) params.lDongRegnCd = lDongRegnCd;
  if (lDongSignguCd) params.lDongSignguCd = lDongSignguCd;
  
  const response = await api.get('/destination/search', { params });
  return response.data;
};

/** 조회수 증가 */
export const increaseViewCount = async (contentid: string) => {
  const response = await api.put(`/destination/${contentid}/view`);
  return response.data;
};

// ============================================
// 리뷰 API
// ============================================

/** 리뷰 등록 (이미지 포함) */
export const createReview = async (reviewData: {
  mId: number;
  contentid: string;
  rvRating: number;
  rvContent: string;
}, images?: File[]) => {
  const formData = new FormData();
  
  // JSON을 Blob으로 변환해서 추가
  formData.append('review', new Blob([JSON.stringify(reviewData)], { type: 'application/json' }));
  
  // 이미지 추가 (최대 3장)
  if (images && images.length > 0) {
    images.slice(0, 3).forEach((file) => {
      formData.append('images', file);
    });
  }
  
  const response = await api.post('/review', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/** 리뷰 이미지 조회 */
export const getReviewImages = async (reviewId: number) => {
  const response = await api.get(`/review/${reviewId}/images`);
  return response.data;
};

/** 여행지별 리뷰 목록 조회 */
export const getReviewsByDestination = async (contentid: string) => {
  const response = await api.get(`/review/destination/${contentid}`);
  return response.data;
};

/** 회원별 리뷰 목록 조회 (마이페이지용) */
export const getReviewsByMember = async (memberId: number) => {
  const response = await api.get(`/review/member/${memberId}`);
  return response.data;
};

/** 리뷰 수정 */
export const updateReview = async (
  reviewId: number, 
  reviewData: { rvRating: number; rvContent: string },
  keepImages?: string[],
  newImages?: File[]
) => {
  const formData = new FormData();
  
  // 리뷰 데이터 (JSON)
  formData.append('review', new Blob([JSON.stringify(reviewData)], { type: 'application/json' }));
  
  // 유지할 이미지 URLs - 각각 개별로 추가
  if (keepImages && keepImages.length > 0) {
    keepImages.forEach((url) => {
      formData.append('keepImages', url);
    });
  }
  
  // 새 이미지 파일
  if (newImages && newImages.length > 0) {
    newImages.forEach((file) => {
      formData.append('newImages', file);
    });
  }
  
  const response = await api.put(`/review/${reviewId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/** 리뷰 삭제 */
export const deleteReview = async (reviewId: number) => {
  const response = await api.delete(`/review/${reviewId}`);
  return response.data;
};

// ============================================
// 찜 API
// ============================================

/** 찜 토글 (추가/해제) */
export const toggleFavorite = async (memberId: number, contentid: string) => {
  const response = await api.post('/favorite/destination/toggle', {
    mId: memberId,
    contentid: contentid
  });
  return response.data;
};

/** 찜 여부 확인 */
export const checkFavorite = async (memberId: number, contentid: string) => {
  const response = await api.get(`/favorite/destination/${contentid}/check`, {
    params: { memberId }
  });
  return response.data;
};

/** 여행지별 찜 개수 조회 */
export const getFavoriteCount = async (contentid: string) => {
  const response = await api.get(`/favorite/destination/${contentid}/count`);
  return response.data;
};

/** 회원별 찜 목록 조회 (마이페이지용) */
export const getFavoritesByMember = async (memberId: number) => {
  const response = await api.get(`/favorite/member/${memberId}`);
  return response.data;
};

/** 여행지 이미지 목록 조회 */
export const getDestinationImages = async (contentid: string) => {
  const response = await api.get(`/destination/detail/${contentid}/images`);
  return response.data;

  
};
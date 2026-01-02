import api from './api';

/**
 * destinationApi.ts - 여행지 관련 API 함수
 * 여행지 목록/상세 조회, 조회수 증가, 리뷰, 찜 기능
 */

// ============================================
// 여행지 기본 API
// ============================================

/** 여행지 목록 조회 (관광타입별) */
export const getDestinationList = async (
  contenttypeid: string, 
  page: number = 1, 
  size: number = 10,
  lDongRegnCd?: string,
  lDongSignguCd?: string
) => {
  const params: any = { page, size };
  if (lDongRegnCd) params.lDongRegnCd = lDongRegnCd;
  if (lDongSignguCd) params.lDongSignguCd = lDongSignguCd;
  
  const response = await api.get(`/destination/list/${contenttypeid}`, { params });
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

/** 리뷰 등록 */
export const createReview = async (reviewData: {
  mId: number;
  contentid: string;
  rvRating: number;
  rvContent: string;
}) => {
  const response = await api.post('/review', reviewData);
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
export const updateReview = async (reviewId: number, reviewData: {
  rvRating: number;
  rvContent: string;
}) => {
  const response = await api.put(`/review/${reviewId}`, reviewData);
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
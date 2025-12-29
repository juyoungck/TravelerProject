import api from './api';

/**
 * 여행지 API
 */

/** 여행지 목록 조회 (관광타입별) */
export const getDestinationList = async (contenttypeid: string, page: number = 1, size: number = 10) => {
  const response = await api.get(`/destination/list/${contenttypeid}`, {
    params: { page, size }
  });
  return response.data;  // 전체 응답 반환 (페이징 정보 포함)
};

/** 여행지 상세 조회 */
export const getDestinationDetail = async (contentid: string) => {
  const response = await api.get(`/destination/detail/${contentid}`);
  return response.data.data;  // data.data로 반환
};

/** 여행지 검색 */
export const searchDestinations = async (keyword: string, page: number = 1, size: number = 10) => {
  const response = await api.get('/destination/search', {
    params: { keyword, page, size }
  });
  return response.data.data;  // data.data로 배열 반환
};
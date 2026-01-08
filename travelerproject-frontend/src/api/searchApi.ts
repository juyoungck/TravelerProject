import api from './api';

/**
 * 통합 검색 API
 */

/** 통합 검색 (여행지 + 플래너) */
export const search = async (keyword: string, page: number = 1, size: number = 10) => {
  const response = await api.get('/search', {
    params: { keyword, page, size }
  });
  return response.data;
};

/** 여행지 검색 */
export const searchDestinations = async (keyword: string, page: number = 1, size: number = 10) => {
  const response = await api.get('/search/destination', {
    params: { keyword, page, size }
  });
  return response.data; // 전체 응답 반환 (data, totalCount, totalPages 포함)
};

/** 플래너 검색 */
export const searchPlanners = async (keyword: string, page: number = 1, size: number = 10) => {
  const response = await api.get('/search/planner', {
    params: { keyword, page, size }
  });
  return response.data; // 전체 응답 반환 (data, totalCount, totalPages 포함)
};
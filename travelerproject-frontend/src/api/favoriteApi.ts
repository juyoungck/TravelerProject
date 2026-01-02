/**
 * favoriteApi.ts - 찜(즐겨찾기) API
 * 마이페이지 찜 목록 조회, 찜 추가/삭제/토글
 * 
 * @author TravelerProject
 */

import api from './api';

// ============================================
// 타입 정의
// ============================================

/** 내 여행지 찜 정보 */
export interface MyFavoriteDestination {
  favId: number;
  mId: number;
  contentid: string;
  createdAt: string;
  // 여행지 정보
  title: string;
  firstimage: string;
  addr1: string;
  contenttypeid: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
}

/** 내 플래너 찜 정보 */
export interface MyFavoritePlanner {
  favId: number;
  mId: number;
  plnId: number;
  createdAt: string;
  // 플래너 정보
  plnTitle: string;
  plnMId: number;
  authorNickname: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  lDongRegnCd: string;
  lDongSignguCd: string;
  isPublic: number;
}

// ============================================
// API 함수
// ============================================

export const favoriteApi = {
  // ============================================
  // 여행지 찜
  // ============================================

  /**
   * 내 여행지 찜 목록 조회
   * GET /api/favorites/destinations
   */
  getMyFavoriteDestinations: async () => {
    const response = await api.get('/favorites/destinations');
    return response.data;
  },

  /**
   * 여행지 찜 추가
   * POST /api/favorites/destinations/{contentid}
   */
  addFavoriteDestination: async (contentid: string) => {
    const response = await api.post(`/favorites/destinations/${contentid}`);
    return response.data;
  },

  /**
   * 여행지 찜 삭제
   * DELETE /api/favorites/destinations/{contentid}
   */
  removeFavoriteDestination: async (contentid: string) => {
    const response = await api.delete(`/favorites/destinations/${contentid}`);
    return response.data;
  },

  /**
   * 여행지 찜 토글 (찜 ↔ 찜 취소)
   * POST /api/favorites/destinations/{contentid}/toggle
   */
  toggleFavoriteDestination: async (contentid: string) => {
    const response = await api.post(`/favorites/destinations/${contentid}/toggle`);
    return response.data;
  },

  /**
   * 여행지 찜 여부 확인
   * GET /api/favorites/destinations/{contentid}/check
   */
  checkFavoriteDestination: async (contentid: string) => {
    const response = await api.get(`/favorites/destinations/${contentid}/check`);
    return response.data;
  },

  // ============================================
  // 플래너 찜
  // ============================================

  /**
   * 내 플래너 찜 목록 조회
   * GET /api/favorites/planners
   */
  getMyFavoritePlanners: async () => {
    const response = await api.get('/favorites/planners');
    return response.data;
  },

  /**
   * 플래너 찜 추가
   * POST /api/favorites/planners/{plnId}
   */
  addFavoritePlanner: async (plnId: number) => {
    const response = await api.post(`/favorites/planners/${plnId}`);
    return response.data;
  },

  /**
   * 플래너 찜 삭제
   * DELETE /api/favorites/planners/{plnId}
   */
  removeFavoritePlanner: async (plnId: number) => {
    const response = await api.delete(`/favorites/planners/${plnId}`);
    return response.data;
  },

  /**
   * 플래너 찜 토글 (찜 ↔ 찜 취소)
   * POST /api/favorites/planners/{plnId}/toggle
   */
  toggleFavoritePlanner: async (plnId: number) => {
    const response = await api.post(`/favorites/planners/${plnId}/toggle`);
    return response.data;
  },

  /**
   * 플래너 찜 여부 확인
   * GET /api/favorites/planners/{plnId}/check
   */
  checkFavoritePlanner: async (plnId: number) => {
    const response = await api.get(`/favorites/planners/${plnId}/check`);
    return response.data;
  },
};

export default favoriteApi;

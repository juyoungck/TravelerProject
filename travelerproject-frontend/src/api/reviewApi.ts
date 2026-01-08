/**
 * reviewApi.ts - 리뷰 API
 * 마이페이지 리뷰 목록 조회, 리뷰 작성/수정/삭제
 * 
 * @author TravelerProject
 */

import api from './api';

// ============================================
// 타입 정의
// ============================================

/** 내 리뷰 정보 */
export interface MyReview {
  rvId: number;
  mId: number;
  contentid: string;
  rvContent: string;
  rvRating: number;
  createdAt: string;
  updatedAt: string;
  // 여행지 정보
  title: string;
  firstimage: string;
  addr1: string;
  contenttypeid: string;
}

/** 리뷰 작성 요청 */
export interface ReviewCreateRequest {
  contentid: string;
  rvContent: string;
  rvRating: number;
}

/** 리뷰 수정 요청 */
export interface ReviewUpdateRequest {
  rvContent: string;
  rvRating: number;
}

// ============================================
// API 함수
// ============================================

export const reviewApi = {
  /**
   * 내 리뷰 목록 조회
   * GET /api/reviews/my
   */
  getMyReviews: async () => {
    const response = await api.get('/reviews/my');
    return response.data;
  },

  /**
   * 특정 여행지의 리뷰 목록 조회
   * GET /api/reviews/destination/{contentid}
   */
  getReviewsByDestination: async (contentid: string) => {
    const response = await api.get(`/reviews/destination/${contentid}`);
    return response.data;
  },

  /**
   * 리뷰 작성
   * POST /api/reviews
   */
  createReview: async (data: ReviewCreateRequest) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  /**
   * 리뷰 수정
   * PUT /api/reviews/{rvId}
   */
  updateReview: async (rvId: number, data: ReviewUpdateRequest) => {
    const response = await api.put(`/reviews/${rvId}`, data);
    return response.data;
  },

  /**
   * 리뷰 삭제
   * DELETE /api/reviews/{rvId}
   */
  deleteReview: async (rvId: number) => {
    const response = await api.delete(`/reviews/${rvId}`);
    return response.data;
  },
};

export default reviewApi;

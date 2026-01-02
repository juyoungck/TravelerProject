/**
 * socialApi.ts
 * 소셜 계정 연동 API
 * 
 * @author TravelerProject
 */

import api from './api';

// ============================================
// 타입 정의
// ============================================

/** 소셜 연동 상태 */
export interface SocialLinkStatus {
  provider: string;    // KAKAO, NAVER, GOOGLE
  linked: boolean;     // 연동 여부
  socialNickname?: string;
  socialEmail?: string;
}

/** 소셜 연동 확정 요청 */
export interface SocialLinkConfirmRequest {
  provider: string;
  providerId: string;
  email?: string;
  nickname?: string;
  useSocialNickname: boolean;
}

/** API 응답 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

// ============================================
// API 호출 함수
// ============================================

export const socialApi = {
  /**
   * 소셜 연동 상태 조회
   */
  getSocialLinkStatus: async (): Promise<ApiResponse<SocialLinkStatus[]>> => {
    const response = await api.get('/auth/social/status');
    return response.data;
  },
  
  /**
   * 소셜 연동 확정
   */
  confirmSocialLink: async (data: SocialLinkConfirmRequest): Promise<ApiResponse> => {
    const response = await api.post('/auth/social/link/confirm', data);
    return response.data;
  },
  
  /**
   * 소셜 연동 시작 URL 반환
   * 실제로는 백엔드로 리다이렉트됨
   */
  getSocialLinkUrl: (provider: string): string => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/api/auth/oauth2/link/${provider.toLowerCase()}`;
  }
};

export default socialApi;

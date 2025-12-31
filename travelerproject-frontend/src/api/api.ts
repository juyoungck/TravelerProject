/**
 * api.ts
 * Axios 인스턴스 설정 및 인터셉터
 * 
 * - baseURL 설정
 * - 요청 시 JWT 토큰 자동 첨부
 * - 응답 시 토큰 만료 처리
 * 
 * @author TravelerProject
 */

import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// 토큰 저장/조회 유틸리티
// ============================================

/** Access Token 저장 키 */
const ACCESS_TOKEN_KEY = 'accessToken';
/** Refresh Token 저장 키 */
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Access Token 저장
 */
export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Access Token 조회
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Refresh Token 저장
 */
export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Refresh Token 조회
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * 모든 토큰 삭제 (로그아웃 시)
 */
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * 로그인 정보 저장 (토큰 + 회원정보)
 */
export const setLoginInfo = (accessToken: string, refreshToken: string, member: any) => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
  localStorage.setItem('memberInfo', JSON.stringify(member));
};

/**
 * 회원정보 조회
 */
export const getMemberInfo = () => {
  const info = localStorage.getItem('memberInfo');
  return info ? JSON.parse(info) : null;
};

/**
 * 로그인 여부 확인
 */
export const isLoggedIn = (): boolean => {
  return !!getAccessToken();
};

// ============================================
// 요청 인터셉터
// ============================================

api.interceptors.request.use(
  (config: any) => {
    // Access Token이 있으면 Authorization 헤더에 추가
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// ============================================
// 응답 인터셉터
// ============================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;
    
    // 401 에러 (토큰 만료) 처리
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          // 토큰 갱신 시도
          const response = await axios.post('http://localhost:8080/api/auth/refresh', {
            refreshToken,
          });
          
          if (response.data.status === 'success') {
            const newAccessToken = response.data.accessToken;
            setAccessToken(newAccessToken);
            
            // 원래 요청 재시도
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // 갱신 실패 시 로그아웃 처리
          clearTokens();
          localStorage.removeItem('memberInfo');
          
          // 로그인 페이지로 이동 (필요 시)
          // window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
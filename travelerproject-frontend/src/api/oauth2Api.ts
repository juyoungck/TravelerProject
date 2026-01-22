/**
 * oauth2Api.ts - 소셜 로그인 API
 * 카카오, 네이버, 구글 소셜 로그인 처리
 * 
 * @author TravelerProject
 */

// 백엔드 서버 주소
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + ":8080";

/**
 * 소셜 로그인 API
 */
export const oauth2Api = {
  /**
   * 카카오 로그인 시작
   * 백엔드를 통해 카카오 로그인 페이지로 리다이렉트
   */
  kakaoLogin: () => {
    window.location.href = `${API_BASE_URL}/api/auth/oauth2/kakao`;
  },

  /**
   * 네이버 로그인 시작
   * 백엔드를 통해 네이버 로그인 페이지로 리다이렉트
   */
  naverLogin: () => {
    window.location.href = `${API_BASE_URL}/api/auth/oauth2/naver`;
  },

  /**
   * 구글 로그인 시작
   * 백엔드를 통해 구글 로그인 페이지로 리다이렉트
   */
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/api/auth/oauth2/google`;
  },
};

export default oauth2Api;

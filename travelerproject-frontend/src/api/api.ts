import axios from 'axios';

/**
 * api.ts - Axios 인스턴스 설정
 * 백엔드 API 호출을 위한 기본 설정
 */

const api = axios.create({
  baseURL: 'http://localhost:8080/api',  // Spring Boot 서버 주소
  timeout: 10000,  // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 로컬스토리지에서 로그인 정보 가져오기
    const userStr = localStorage.getItem('user');
    if (userStr) {
      // 필요시 헤더에 추가 가능
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API 에러:', error);
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

/**
 * axios 기본 설정
 * 백엔드 서버와 통신하기 위한 인스턴스
 */
const api = axios.create({
  baseURL: 'http://localhost:8080/api',  // Spring Boot 서버 주소
  timeout: 10000,  // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
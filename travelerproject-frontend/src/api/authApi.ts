/**
 * authApi.ts
 * 회원 인증 관련 API 호출 모듈
 * 
 * 사용법:
 * import { authApi } from './api/authApi';
 * 
 * // 로그인
 * const result = await authApi.login({ username: 'test', password: '1234' });
 * 
 * @author TravelerProject
 */

import api from './api';

// ============================================
// 타입 정의
// ============================================

/** 회원가입 요청 */
export interface SignupRequest {
  username: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  email: string;
  phone?: string;
  gender?: 'M' | 'F' | 'OTHER';
  birth?: string; // yyyy-MM-dd 형식
  verificationCode: string;
}

/** 로그인 요청 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 로그인 응답 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  member: MemberInfo;
}

/** 회원 정보 */
export interface MemberInfo {
  mId: number;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
  gender?: string;
  birth?: string;
  role: string;
  loginType: string;
  regdate: string;
}

/** 회원정보 수정 요청 */
export interface MemberUpdateRequest {
  nickname?: string;
  phone?: string;
  gender?: string;   // ⭐ 추가
  birth?: string;    // ⭐ 추가
}

/** 비밀번호 변경 요청 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

/** 비밀번호 재설정 요청 */
export interface PasswordResetRequest {
  username: string;
  email: string;
  verificationCode: string;
  newPassword: string;
  newPasswordConfirm: string;
}

/** API 응답 공통 형식 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

// ============================================
// API 호출 함수
// ============================================

export const authApi = {
  // ============================================
  // 회원가입 관련
  // ============================================
  
  /**
   * 아이디 중복 체크
   * @param username 확인할 아이디
   */
  checkUsername: async (username: string): Promise<ApiResponse<{ available: boolean }>> => {
    const response = await api.get('/auth/check/username', { params: { username } });
    return response.data;
  },
  
  /**
   * 이메일 중복 체크
   * @param email 확인할 이메일
   */
  checkEmail: async (email: string): Promise<ApiResponse<{ available: boolean }>> => {
    const response = await api.get('/auth/check/email', { params: { email } });
    return response.data;
  },
  
  /**
   * 닉네임 중복 체크
   * @param nickname 확인할 닉네임
   */
  checkNickname: async (nickname: string): Promise<ApiResponse<{ available: boolean }>> => {
    const response = await api.get('/auth/check/nickname', { params: { nickname } });
    return response.data;
  },
  
  /**
   * 이메일 인증 코드 발송
   * @param email 이메일 주소
   */
  sendVerificationCode: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/email/send', { email });
    return response.data;
  },
  
  /**
   * 이메일 인증 코드 확인
   * @param email 이메일 주소
   * @param code 인증 코드
   */
  verifyEmailCode: async (email: string, code: string): Promise<ApiResponse<{ verified: boolean }>> => {
    const response = await api.post('/auth/email/verify', { email, code });
    return response.data;
  },
  
  /**
   * 회원가입
   * @param data 회원가입 정보
   */
  signup: async (data: SignupRequest): Promise<ApiResponse<MemberInfo>> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  
  // ============================================
  // 로그인/로그아웃 관련
  // ============================================
  
  /**
   * 로그인
   * @param data 로그인 정보
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  /**
   * 로그아웃
   * @param refreshToken 리프레시 토큰
   */
  logout: async (refreshToken: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },
  
  /**
   * Access Token 갱신
   * @param refreshToken 리프레시 토큰
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
  
  // ============================================
  // 아이디/비밀번호 찾기 관련
  // ============================================
  
  /**
   * 아이디 찾기 (이메일로 전송)
   * @param email 이메일 주소
   */
  findUsername: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/find/username', { email });
    return response.data;
  },
  
  /**
   * 비밀번호 찾기 - 인증 코드 발송
   * @param username 아이디
   * @param email 이메일 주소
   */
  findPasswordVerify: async (username: string, email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/find/password/verify', { username, email });
    return response.data;
  },
  
  /**
   * 비밀번호 재설정
   * @param data 비밀번호 재설정 정보
   */
  resetPassword: async (data: PasswordResetRequest): Promise<ApiResponse> => {
    const response = await api.post('/auth/find/password/reset', data);
    return response.data;
  },
  
  // ============================================
  // 마이페이지 관련
  // ============================================
  
  /**
   * 내 정보 조회
   * Authorization 헤더에 토큰이 자동으로 포함됨 (api.ts의 인터셉터 설정 필요)
   */
  getMyInfo: async (): Promise<ApiResponse<MemberInfo>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  /**
   * 내 정보 수정
   * @param data 수정할 정보
   */
  updateMyInfo: async (data: MemberUpdateRequest): Promise<ApiResponse<MemberInfo>> => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },
  
  /**
   * 비밀번호 변경
   * @param data 비밀번호 변경 정보
   */
  changePassword: async (data: PasswordChangeRequest): Promise<ApiResponse> => {
    const response = await api.put('/auth/me/password', data);
    return response.data;
  },
  
  /**
   * 회원 탈퇴
   * @param password 비밀번호 확인
   */
  withdraw: async (password: string): Promise<ApiResponse> => {
    const response = await api.delete('/auth/me', { data: { password } });
    return response.data;
  },
};

export default authApi;

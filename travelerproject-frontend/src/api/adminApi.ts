/**
 * adminApi.ts - 관리자 API
 * 
 * 회원 관리, 게시판 관리, 리뷰 관리 API
 * 
 * @author TravelerProject
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + ":8080/api";

/** Axios 인스턴스 (토큰 자동 포함) */
const adminAxios = axios.create({
  baseURL: API_BASE_URL,
});

// 요청 인터셉터 - 토큰 자동 추가
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// 타입 정의
// ============================================

/** 회원 정보 */
export interface AdminMember {
  mId: number;
  mUsername: string;
  mNickname: string;
  mEmail: string;
  mPhone: string;
  mBirth: string;
  mGender: string;
  mRole: string;
  mStatus: string;
  mLoginType: string;
  mRegdate: string;
}

/** 게시글 정보 */
export interface AdminBoard {
  bdId: number;
  mId: number;
  bdTitle: string;
  bdContent: string;
  bdCategory: string;
  isDeleted: number;  // 0: 공개, 1: 숨김
  bdViewCount: number;
  createdAt: string;
  updatedAt: string;
  authorNickname: string;
}

/** 리뷰 정보 */
export interface AdminReview {
  rvId: number;
  mId: number;
  contentid: string;
  rvContent: string;
  rvRating: number;
  createdAt: string;
  authorNickname: string;
  destinationTitle?: string;
}

/** 플래너 정보 */
export interface AdminPlanner {
  plnId: number;
  mId: number;
  plnTitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  isPublic: number;
  createdAt: string;
  authorNickname: string;
}

/** 대시보드 통계 */
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalBoards: number;
  publicBoards: number;
  hiddenBoards: number;
  totalReviews: number;
  totalPlanners: number;
  publicPlanners: number;
  privatePlanners: number;
  todayNewMembers: number;
  todayNewBoards: number;
  todayNewPlanners: number;
}

/** API 응답 (목록) */
export interface AdminListResponse<T> {
  status: string;
  message?: string;
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

/** API 응답 (단일) */
export interface AdminResponse {
  status: string;
  message?: string;
  data?: any;
}

// ============================================
// 대시보드 API
// ============================================

/**
 * 대시보드 통계 조회
 */
export const getDashboardStats = async (): Promise<AdminResponse> => {
  const response = await adminAxios.get('/admin/dashboard');
  return response.data;
};

// ============================================
// 회원 관리 API
// ============================================

/**
 * 전체 회원 목록 조회
 */
export const getMembers = async (
  page: number = 1,
  size: number = 10,
  search?: string,
  status?: string
): Promise<AdminListResponse<AdminMember>> => {
  const params: any = { page, size };
  if (search) params.search = search;
  if (status) params.status = status;
  
  const response = await adminAxios.get('/admin/members', { params });
  return response.data;
};

/**
 * 회원 상태 변경
 */
export const updateMemberStatus = async (
  mId: number,
  status: 'ACTIVE' | 'DELETED'
): Promise<AdminResponse> => {
  const response = await adminAxios.put(`/admin/members/${mId}/status`, { status });
  return response.data;
};

/**
 * 회원 삭제
 */
export const deleteMember = async (mId: number): Promise<AdminResponse> => {
  const response = await adminAxios.delete(`/admin/members/${mId}`);
  return response.data;
};

// ============================================
// 게시판 관리 API
// ============================================

/**
 * 전체 게시글 목록 조회
 */
export const getBoards = async (
  page: number = 1,
  size: number = 10,
  search?: string,
  status?: string
): Promise<AdminListResponse<AdminBoard>> => {
  const params: any = { page, size };
  if (search) params.search = search;
  if (status) params.status = status;
  
  const response = await adminAxios.get('/admin/boards', { params });
  return response.data;
};

/**
 * 게시글 상태 변경
 */
export const updateBoardStatus = async (
  bdId: number,
  status: 'PUBLIC' | 'HIDDEN'
): Promise<AdminResponse> => {
  const response = await adminAxios.put(`/admin/boards/${bdId}/status`, { status });
  return response.data;
};

/**
 * 게시글 삭제
 */
export const deleteBoard = async (bdId: number): Promise<AdminResponse> => {
  const response = await adminAxios.delete(`/admin/boards/${bdId}`);
  return response.data;
};

// ============================================
// 리뷰 관리 API
// ============================================

/**
 * 전체 리뷰 목록 조회
 */
export const getReviews = async (
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<AdminListResponse<AdminReview>> => {
  const params: any = { page, size };
  if (search) params.search = search;
  
  const response = await adminAxios.get('/admin/reviews', { params });
  return response.data;
};

/**
 * 리뷰 삭제
 */
export const deleteReview = async (rvId: number): Promise<AdminResponse> => {
  const response = await adminAxios.delete(`/admin/reviews/${rvId}`);
  return response.data;
};

// ============================================
// 플래너 관리 API
// ============================================

/** 플래너 목록 조회 */
export const getPlanners = async (
  page: number = 1,
  size: number = 10,
  search?: string,
  status?: string
): Promise<AdminListResponse<AdminPlanner>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const response = await adminAxios.get(`/admin/planners?${params.toString()}`);
  return response.data;
};

/** 플래너 상태 변경 (공개/비공개) */
export const updatePlannerStatus = async (
  plnId: number,
  status: 'PUBLIC' | 'PRIVATE'
): Promise<AdminResponse> => {
  const response = await adminAxios.put(`/admin/planners/${plnId}/status`, { status });
  return response.data;
};

/** 플래너 삭제 */
export const deletePlanner = async (plnId: number): Promise<AdminResponse> => {
  const response = await adminAxios.delete(`/admin/planners/${plnId}`);
  return response.data;
};

// ============================================
// 내보내기
// ============================================

export const adminApi = {
  // 대시보드
  getDashboardStats,
  
  // 회원 관리
  getMembers,
  updateMemberStatus,
  deleteMember,
  
  // 게시판 관리
  getBoards,
  updateBoardStatus,
  deleteBoard,
  
  // 리뷰 관리
  getReviews,
  deleteReview,
  
  // 플래너 관리
  getPlanners,
  updatePlannerStatus,
  deletePlanner,
};

export default adminApi;
